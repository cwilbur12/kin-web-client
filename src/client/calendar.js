/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import 'fullcalendar';
import moment from 'moment';
import normalize_wheel from 'normalize-wheel';
import _ from 'lodash';

import { EVENTS_NS } from './config';
import { fetch_error, is_create_able_layer,
         merge_ids, create_message_popup, shift_lum,
         user_config, split_merged_id } from './utils';
import { async_save_event, create_event,
        deselect_event, select_event } from './actions/events';
import { get_full_calendar_view, update_full_calendar_view } from './actions/ui';


const SCROLL_COOLDOWN = 500;
const META_LAYER_CREATE_EVENT = 'kin-0:meta-create-layer';


function _layer_to_fc_event_source(layer) {
    const fc_event_source = {
        id: layer.id,
        color: shift_lum(layer.color, 85),
        textColor: shift_lum(layer.color, 25),
        editable: _.get(layer, ['acl', 'edit'], false),
    };
    return fc_event_source;
}


function _event_to_fc_event(timezone, event) {
    const fc_event = _.cloneDeep(event);

    fc_event.className = '';
    if (!_.isEmpty(fc_event.kind)) {
        if (fc_event.kind.indexOf('invitation') !== -1) {
            fc_event.className = 'striped';
        }
    }

    if (_.isNull(fc_event.start)) {
        fc_event.start = moment().tz(timezone);
    }

    if (!_.isNull(fc_event.start) && !_.isNull(fc_event.end)) {
        const diff = fc_event.end.diff(fc_event.start, 'minutes');
        if (diff < 30) {
            fc_event.end = moment(fc_event.start).add(30, 'minutes');
        }
        if (diff > 24 * 60) {
            fc_event.allDay = true;
            fc_event.end.subtract(1, 'minute').add(1, 'day');
        }
    }

    // color mgmt
    if (!_.isEmpty(event.color)) {
        fc_event.color = shift_lum(event.color, 85);
        fc_event.textColor = shift_lum(event.color, 25);
    }

    // Make sure event is not in "syncing" mode
    fc_event.syncing = false;
    fc_event.editable = undefined;

    // handle selection
    fc_event.selected = false;

    return fc_event;
}


export default class Calendar {
    constructor() {
        this._day_click_handler = this._day_click_handler.bind(this);
        this._event_click_handler = this._event_click_handler.bind(this);
        this._event_render = this._event_render.bind(this);
        this._move_event_handler = this._move_event_handler.bind(this);
        this._move_event_handler = this._move_event_handler.bind(this);
        this._select_handler = this._select_handler.bind(this);
    }

    create($parent, store) {
        this._store = store;
        this._$calendar = this._create_fullcalendar($parent);

        // Ugly ass solution to make sure we have the fc-toolbar in the right state
        const collapsed = user_config.is_collapsed('kin:menu');
        $('.fc-toolbar').toggleClass('margin', collapsed);

        this._update_view_switch();
        $parent.data('calendar', this);

        this._last_scroll = performance.now();
    }

    middleware(store) {
        return next => (action) => {
            const state = store.getState();

            if (action.type === 'ADD_EVENTS') {
                if (action.creating) {
                    const fc_events = _.map(
                        action.events,
                        _.partial(_event_to_fc_event, user_config.timezone)
                    );

                    const event_source = _layer_to_fc_event_source({
                        id: META_LAYER_CREATE_EVENT,
                        acl: {
                            create: false,
                            edit: false,
                            delete: false,
                        },
                        color: '#EC4956',
                        text_color: '#FFFFFF',
                        events: [],
                        selected: true,
                        loaded: true,
                    });
                    event_source.events = fc_events;
                    this.add_layer(event_source);
                } else {
                    const layers_update = {};
                    _.forEach(action.events, (event) => {
                        const [source_id, short_layer_id, ] = split_merged_id(event.id); // eslint-disable-line array-bracket-spacing
                        const layer_id = merge_ids(source_id, short_layer_id);
                        if (_.get(state, ['layers', layer_id, 'loaded'], false)) {
                            const fc_event = _event_to_fc_event(user_config.timezone, event);
                            if (!(layer_id in layers_update)) {
                                layers_update[layer_id] = [];
                            }
                            layers_update[layer_id].push(fc_event);
                        }
                    });

                    _.forEach(layers_update, (events, layer_id) => {
                        this.add_events(layer_id, events);
                    });
                }
            }

            if (action.type === 'PATCH_EVENTS') {
                this.patch_events(action.events);
            }

            if (action.type === 'DELETE_EVENTS') {
                this.remove_events(action.ids);
            }

            if (action.type === 'PATCH_LAYER') {
                if (action.patch.loaded === true) {
                    const layer = state.layers[action.id];
                    if (layer.loaded !== true) {
                        const events = _(state.events)
                            .at(layer.events)
                            .map(_.partial(_event_to_fc_event, user_config.timezone))
                            .value();
                        const event_source = _layer_to_fc_event_source(layer);
                        event_source.events = events;
                        this.add_layer(event_source);
                    }
                } else {
                    this.remove_layer(action.id);
                }
            }

            if (action.type === 'SELECT_EVENT') {
                const event_id = action.id;
                const [source_id, short_layer_id, ] = split_merged_id(event_id); // eslint-disable-line array-bracket-spacing
                const layer_id = merge_ids(source_id, short_layer_id);
                const event = _.get(state, ['events', event_id], {});
                const color = _.get(event, 'color', _.get(state, ['layers', layer_id, 'color'], null));
                this.patch_events(
                    [
                        {
                            id: event_id,
                            color: shift_lum(color, 70),
                            textColor: 'white',
                            selected: true,
                        },
                    ]
                );
                this._$calendar.fullCalendar('option', {
                    selectable: false,
                });
            }

            if (action.type === 'DESELECT_EVENT') {
                if (!this._remove_placeholder_event()) {
                    const fc_event_update = {
                        id: state.selected_event.id,
                        selected: false,
                    };

                    const state_event = _.get(state, ['events', state.selected_event.id], {});
                    if (!_.isEmpty(state_event.color)) {
                        fc_event_update.color = shift_lum(state_event.color, 85);
                        fc_event_update.textColor = shift_lum(state_event.color, 25);
                    } else {
                        fc_event_update.color = null;
                        fc_event_update.textColor = null;
                    }

                    this.patch_events([fc_event_update]);
                }
                this._$calendar.fullCalendar('option', {
                    selectable: true,
                });
            }

            next(action);
        };
    }

    bind_events() {
        $(window).on(`resize.${EVENTS_NS}`, this.resize.bind(this));
        this._$calendar.on(`mousewheel.${EVENTS_NS}`, this.scroll.bind(this));
    }

    unbind_events() {
        this._$calendar.off(`mousewheel.${EVENTS_NS}`);
        $(window).off(`resize.${EVENTS_NS}`);
    }


    /*
     * Custom Event Handlers
     */
    resize() {
        const width = $('.content').width();
        const height = $(window).height() - 35;
        const ratio = width / height;
        this._$calendar.fullCalendar('option', 'aspectRatio', ratio);
    }

    scroll(event) {
        const current_view = this._$calendar.fullCalendar('getView').name;
        const normalized = normalize_wheel(event.originalEvent);

        if (normalized.pixelY === 0 || current_view === 'month') {
            if ((performance.now() - this._last_scroll) > SCROLL_COOLDOWN) {
                if (normalized.pixelX <= -10 || normalized.pixelY <= -10) {
                    this._store.dispatch(deselect_event());
                    this._$calendar.fullCalendar('prev');
                    this._store.dispatch(
                        update_full_calendar_view(get_full_calendar_view()));
                    this._last_scroll = performance.now();
                } else if (normalized.pixelX >= 10 || normalized.pixelY >= 10) {
                    this._store.dispatch(deselect_event());
                    this._$calendar.fullCalendar('next');
                    this._store.dispatch(
                        update_full_calendar_view(get_full_calendar_view()));
                    this._last_scroll = performance.now();
                }
            }
            return false;
        }
        return true;
    }


    /*
     * Data Manipulations
     */
    add_layer(layer) {
        this.remove_layer(layer.id);
        this._$calendar.fullCalendar('addEventSource', layer);
    }

    remove_layer(layer_id) {
        const fc_event_source = this._$calendar.fullCalendar('getEventSourceById', layer_id);
        if (fc_event_source !== undefined) {
            // Otherwise FullCalendar will still report event changes even with an empty source
            this._$calendar.fullCalendar('removeEventSource', layer_id);
        }
    }

    add_events(layer_id, fc_events) {
        // All events should have an ID matching the layer_id
        if (!_.isEmpty(fc_events)) {
            const fc_event_source = this._$calendar.fullCalendar('getEventSourceById', layer_id);
            this._$calendar.fullCalendar('removeEventSource', fc_event_source);
            const events = _(fc_event_source.events)
                  .keyBy('id')
                  .assign(_.keyBy(fc_events, 'id'))
                  .values()
                  .value();
            fc_event_source.events = events;
            this._$calendar.fullCalendar('addEventSource', fc_event_source);
        }
    }

    remove_events(fc_events_id) {
        if (!_.isEmpty(fc_events_id)) {
            this._$calendar.fullCalendar(
                'removeEvents', fc_event => fc_events_id.indexOf(fc_event._id) !== -1);
        }
    }

    patch_events(fc_events_patch) {
        _.forEach(fc_events_patch, (fc_event_patch) => {
            // Will remove all properties set `undefined` in `fc_event_patch`
            const fc_event = this._$calendar.fullCalendar('clientEvents', fc_event_patch.id)[0];
            if (!_.isUndefined(fc_event)) { // Events can become undefined due to updates etc ...
                _.merge(fc_event, fc_event_patch);
                _(fc_event_patch).forEach((val, prop) => {
                    if (val === undefined) {
                        delete fc_event[prop];
                    }
                });
                this._$calendar.fullCalendar('updateEvent', fc_event);
            }
        });
    }


    /*
     * FC Event Handlers
     */
    _day_click_handler() {
        const selectable = this._$calendar.fullCalendar('option', 'selectable');
        if (!selectable) {
            this._store.dispatch(deselect_event());
        }
    }

    _event_click_handler(event) {
        this._store.dispatch(select_event(event.id, false));
    }

    _move_event_handler(event, delta, revert_func) {
        const event_patch = {};

        // TODO: double check this
        const dates = {
            start: event.start,
            end: _.isEmpty(event.end) ? $.fullCalendar.moment(event.start).add(1, event.allDay ? 'day' : 'hour') : event.end,
        };

        _(['start', 'end'])
            .forEach((prop) => {
                event_patch[prop] = {};
                if (event.allDay) {
                    event_patch[prop].date = dates[prop].format('YYYY-MM-DD');
                } else {
                    event_patch[prop].date_time = moment.tz(
                        dates[prop].format(), user_config.timezone).format();
                }
            });

        this._store.dispatch(async_save_event(event.id, event_patch))
            .catch((error) => {
                fetch_error(error);
                revert_func();
            });
    }

    _select_handler(start_date, end_date) {
        const redux_state = this._store.getState();
        if (_.isNull(redux_state.selected_event.id)) {
            // Let's try to get currently set default calendar
            let default_layer = _.get(redux_state, ['layers', user_config.default_calendar_id], undefined);

            if (_.isUndefined(default_layer) || !is_create_able_layer(default_layer)) {
                // Try to fallback to a "random" layer
                default_layer = _.find(redux_state.layers, is_create_able_layer);
            }

            if (!_.isUndefined(default_layer)) {
                const event = {
                    id: merge_ids(default_layer.id, 'kintoday_creating_event'),
                    title: '',
                    start: {},
                    end: {},
                    color: default_layer.color,
                    textColor: default_layer.textColor,
                    all_day: !start_date.hasTime(),
                };
                // FC feeds us a moment in local tz, we "format" it to loose
                // any timezone information it has and re-parse it with the
                // user's current tz.
                const format = start_date.hasTime() ? 'YYYY-MM-DD[T]HH:mm:ss' : 'YYYY-MM-DD';
                const start_date_tzed = moment.tz(start_date.format(format), user_config.timezone);
                const end_date_tzed = moment.tz(end_date.format(format), user_config.timezone);
                event.start[start_date.hasTime() ? 'date_time' : 'date'] = start_date_tzed.format();
                event.end[end_date.hasTime() ? 'date_time' : 'date'] = end_date_tzed.format();
                this._store.dispatch(create_event(event));
            } else {
                create_message_popup('no editable calendar loaded', ['error']);
            }
        } else {
            this._store.dispatch(deselect_event());
        }
        this._$calendar.fullCalendar('unselect');
    }


    /*
     * FC-specific functions
     */
    _event_render(fc_event, $elem, view) {
        $elem.attr('data-id', fc_event.id);
        if (fc_event.syncing === true) {
            $elem.prepend('<div class="loading"></div>');
        } else {
            $elem.find('.loading').remove();
        }
        if (!fc_event.allDay && !fc_event.selected && view.name === 'month') {
            $elem.css('background', 'inherit');
        }
    }

    _create_fullcalendar($parent) {
        const settings = {
            header: false,

            dayClick: this._day_click_handler,
            eventClick: this._event_click_handler,
            eventRender: this._event_render,
            eventResize: this._move_event_handler,
            eventDrop: this._move_event_handler,
            select: this._select_handler,

            defaultView: user_config.default_view,
            firstDay: user_config.first_day,

            views: {
                agendaWeek: {
                    columnFormat: user_config.date_format,
                    slotLabelFormat: user_config.time_format,
                    timeFormat: user_config.time_format,
                },
                month: {
                    fixedWeekCount: false,
                    columnFormat: 'dddd',
                    timeFormat: user_config.time_format,
                },
            },

            defaultTimedEventDuration: '01:00:00',
            forceEventDuration: true,
            nextDayThreshold: '00:00:00',

            eventLimit: true,
            handleWindowResize: false,
            nowIndicator: true,
            selectable: true,
        };
        return $parent.fullCalendar(settings);
    }

    _update_view_switch() {
        const current_view = this._$calendar.fullCalendar('getView');
        const is_month = (current_view.name === 'month');
        $('.view-switch')
            .toggleClass('fa-th', !is_month)
            .toggleClass('fa-bars', is_month);
    }

    /*
     * Redux helpers
     */
    _remove_placeholder_event() {
        const fake_source = this._$calendar.fullCalendar('getEventSourceById', META_LAYER_CREATE_EVENT);
        if (!_.isUndefined(fake_source)) {
            this._$calendar.fullCalendar('removeEventSource', META_LAYER_CREATE_EVENT);
            return true;
        }
        return false;
    }
}
