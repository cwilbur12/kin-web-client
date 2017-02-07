/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import 'whatwg-fetch';
import bluebird from 'bluebird';
import moment from 'moment-timezone';
import _ from 'lodash';

import { api_url, fetch_options, fetch_check, user_config } from '../utils';
import { patch_layer } from './layers';
import { toggle_color_picker_tooltip } from './ui';


/**
 * Private helpers functions
 */
const _event_to_redux = (timezone, event) => {
    /* eslint-disable no-param-reassign */
    event.allDay = (_.has(event, 'start.date') || _.has(event, 'end.date'));

    _.forEach(['start', 'end'], (prop) => {
        if (!_.isEmpty(event[prop])) {
            event[prop] = moment(event[prop].date_time || event[prop].date).tz(timezone);
        } else {
            event[prop] = null;
        }
    });

    return event;
    /* eslint-disable no-param-reassign */
};


/**
 * Others Action creators
 */
export const add_events = (events, creating = false) => {
    return {
        type: 'ADD_EVENTS',
        creating,
        events,
    };
};


export const patch_events = (events) => {
    return {
        type: 'PATCH_EVENTS',
        events
    };
};


export const delete_events = (ids) => {
    return {
        type: 'DELETE_EVENTS',
        ids,
    };
};


export const deselect_event = () => {
    return (dispatch, get_state) => {
        const state = get_state();
        if (!_.isNull(state.selected_event.id)) {
            if (state.selected_event.dirty) {
                $('#leave-edit-mode-modal').foundation('open');
                return false;
            }

            dispatch({
                type: 'DESELECT_EVENT',
            });

            // Make sure that the color picker is hidden
            if (state.ui.color_picker_tooltip.show) {
                dispatch(toggle_color_picker_tooltip(false));
            }
        }
        return true;
    };
};


export const select_event = (event_id, creating = false, force = false) => {
    return (dispatch, get_state) => {
        const state = get_state();
        if (event_id !== state.selected_event.id || force) {
            const did_deselect = dispatch(deselect_event());
            if (did_deselect) {
                dispatch({
                    type: 'SELECT_EVENT',
                    id: event_id,
                    force,
                    creating,
                });
            }
        }
    };
};


export const create_event = (event) => {
    return (dispatch) => {
        const redux_event = _event_to_redux(user_config.timezone, event);
        dispatch(add_events([redux_event], true));
        dispatch(select_event(redux_event.id, true));
    };
};


export const toggle_edit_selected_event = () => {
    return {
        type: 'TOGGLE_EDIT_SELECTED_EVENT',
    };
};


export const set_dirty_selected_event = (dirty) => {
    return {
        type: 'SET_DIRTY_SELECTED_EVENT',
        dirty,
    };
};


/**
 * Async actions creators
 */
export const async_load_events = (layer_id) => {
    return (dispatch, get_state) => {
        const sync_token = _.get(get_state(), ['layers', layer_id, 'sync_token']);
        const full_sync = _.isNil(sync_token);
        const qs = {};
        if (!full_sync) {
            qs.sync_token = sync_token;
        }

        return fetch(
            api_url(`/layers/${escape(layer_id)}/events`, qs),
            fetch_options()
        )
            .then(_.partial(fetch_check, dispatch))
            .then((json_res) => {
                const redux_events = _(json_res.events)
                    .filter(event => event.status !== 'cancelled')
                    .map(_.partial(_event_to_redux, user_config.timezone))
                    .value();

                const is_incremental = _.get(json_res, 'sync_type') === 'incremental';
                let deleted_events_ids = [];
                if (is_incremental) {
                    deleted_events_ids = _(json_res.events)
                        .filter(event => event.status === 'cancelled')
                        .map('id')
                        .value();
                } else {
                    // We need to "remove" all the events that we currently have that are not in the new set
                    const state = get_state();
                    const layer = state.layers[layer_id];
                    deleted_events_ids = _.difference(layer.events, _.map(redux_events, 'id'));
                }
                if (!_.isEmpty(deleted_events_ids)) {
                    dispatch(delete_events(deleted_events_ids));
                }

                dispatch(add_events(redux_events));
                dispatch(patch_layer(layer_id, {
                    loaded: true,
                    sync_token: json_res.next_sync_token,
                }));
            });
    };
};


export const async_create_event = (layer_id, event, notify_attendees = false) => {
    return (dispatch, get_state) => {
        const qs = {
            notify: notify_attendees,
        };
        return fetch(
            api_url(`/layers/${escape(layer_id)}/events`, qs),
            fetch_options({
                method: 'POST',
                body: JSON.stringify(event),
            })
        )
            .then(_.partial(fetch_check, dispatch))
            .then((json_res) => {
                // TODO: handle error smoothly
                const state = get_state();
                dispatch(delete_events([state.selected_event.id])); // still contains the "creation" id

                const redux_event = _event_to_redux(user_config.timezone, json_res.event);
                dispatch(add_events([redux_event]));
                dispatch(deselect_event());
            });
    };
};


export const async_save_event = (event_id, event_patch, notify_attendees = false) => {
    return (dispatch, get_state) => {
        const state = get_state();
        const event = state.events[event_id];
        event_patch.etag = event.etag;

        dispatch(deselect_event());
        dispatch(patch_events([{
            id: event_id,
            syncing: true,
        }]));

        const qs = {
            notify: notify_attendees,
        };
        return fetch(
            api_url(`/events/${escape(event_id)}`, qs),
            fetch_options({
                method: 'PATCH',
                body: JSON.stringify(event_patch),
            })
        )
            .then(_.partial(fetch_check, dispatch))
            .then((json_res) => {
                const redux_event = _event_to_redux(user_config.timezone, json_res.event);
                dispatch(add_events([redux_event]));
                dispatch(deselect_event());
            })
            .catch((err) => {
                dispatch(patch_events([{
                    id: event_id,
                    syncing: false,
                }]));
                throw err;
            });
    };
};


export const async_delete_event = (event_id) => {
    return (dispatch, get_state) => {
        const state = get_state();
        const event = state.events[event_id];
        if (!_.isNil(event)) {
            return fetch(
                api_url(`/events/${escape(event_id)}`),
                fetch_options({
                    method: 'DELETE',
                    body: JSON.stringify({
                        etag: event.etag,
                    }),
                })
            )
                .then(_.partial(fetch_check, dispatch))
                .then(() => {
                    dispatch(deselect_event());
                    dispatch(delete_events([event_id]));
                });
        }
        return bluebird.reject(new Error('event is already deleted'));
    };
};
