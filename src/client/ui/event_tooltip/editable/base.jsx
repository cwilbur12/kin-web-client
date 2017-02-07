/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { round as moment_round } from 'spotoninc-moment-round';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import _ from 'lodash';

import { expanded_source_prop_type, event_prop_type, layer_prop_type } from '../../../prop_types';
import { fetch_error, get_create_able_sources, merge_ids, split_merged_id, user_config } from '../../../utils';
import { async_create_event, async_save_event, set_dirty_selected_event } from '../../../actions/events';
import AttendeeSubTooltip from './attendee_sub_tooltip';
import DescriptionSubTooltip from './description_sub_tooltip';
import MainSubTooltip from './main_sub_tooltip';
import ReminderSubTooltip from './reminder_sub_tooltip';


class EditableEventTooltip extends React.Component {
    constructor(props) {
        super(props);

        const [source_id, short_layer_id, ] = split_merged_id(_.get(props.event, 'id', '')); // eslint-disable-line array-bracket-spacing
        const layer_id = merge_ids(source_id, short_layer_id);

        this.state = {
            subtooltip: 'main',
            focused_input: 'title',
        };

        const normalized_event = {
            title: _.get(props.event, 'title', ''),
            layer_id,
            start: _.get(props.event, 'start', null),
            end: _.get(props.event, 'end', null),
            all_day: _.get(props.event, 'allDay', false),
            location: _.get(props.event, 'location', ''),
            attendees: _.get(props.event, 'attendees', []),
            description: _.get(props.event, 'description', ''),
            reminders: _.get(props.event, 'reminders', []),
        };
        if (normalized_event.all_day &&
            normalized_event.start !== null &&
            normalized_event.end !== null) {
            if (normalized_event.start.hour() === 0 && normalized_event.start.minute() === 0 &&
                normalized_event.end.hour() === 0 && normalized_event.end.minute() === 0) {
                const current = moment.tz(user_config.timezone);
                moment_round.call(current, 1, 'hour');
                normalized_event.start.set({
                    hour: current.get('hour'),
                    minute: current.get('minute'),
                });
                normalized_event.end.set({
                    hour: current.get('hour') + 1,
                    minute: current.get('minute'),
                });
            }
        }

        this.state.editing_event = normalized_event;
        this._edited_event = _.merge({}, normalized_event);

        this.save_edit = this.save_edit.bind(this);
        this.toggle_subtooltip = {
            attendees: this.toggle_subtooltip.bind(this, 'attendees'),
            description: this.toggle_subtooltip.bind(this, 'description'),
            reminders: this.toggle_subtooltip.bind(this, 'reminders'),
        };
        this._on_change = this._on_change.bind(this);
        this._on_input_blur = this._on_input_blur.bind(this);
        this._on_input_focus = this._on_input_focus.bind(this);
    }

    _on_input_focus(prop_name) {
        if (this.state.focused_input !== prop_name) {
            this.setState({
                focused_input: prop_name,
            });
        }
    }

    _on_input_blur(prop_name) {
        if (this.state.focused_input === prop_name) {
            this.setState({
                focused_input: null,
            });
        }
    }

    _on_change(state_patch) {
        const editing_event = _.assign({}, this.state.editing_event, state_patch);
        this.setState({ editing_event }, () => {
            if (this._is_patch_dirty(state_patch)) {
                if (!this.props.dirty) {
                    this.props.dispatch(set_dirty_selected_event(true));
                }
                // nothing, patch is dirty, event is already dirty
            } else if (this.props.dirty && !this._is_state_dirty()) {
                // patch is not dirty, state is globally not dirty, event should be un-dirtified
                // (case when a patch un-dirtify an event)
                this.props.dispatch(set_dirty_selected_event(false));
            }
        });
    }

    _is_patch_dirty(state_patch) {
        // TODO: issue with start / end dates
        return _.some(state_patch, (val, key) => {
            if (key === 'start' || key === 'end') {
                // moments
                if (this._edited_event[key] === null || val === null) {
                    return this._edited_event[key] !== val;
                }
                return !this._edited_event[key].isSame(val);
            }
            return !_.isEqual(this._edited_event[key], val);
        });
    }

    _is_state_dirty() {
        return this._is_patch_dirty(this.state.editing_event);
    }

    save_edit() {
        const event_patch = _.omit(this.state.editing_event, ['layer_id', 'all_day', 'subtooltip']);

        if (this.state.editing_event.all_day) {
            if (!_.isEmpty(event_patch.start)) {
                event_patch.start = { date: event_patch.start.format('YYYY-MM-DD') };
            }
            if (!_.isEmpty(event_patch.end)) {
                event_patch.end = { date: event_patch.end.format('YYYY-MM-DD') };
            }
        } else {
            if (!_.isEmpty(event_patch.start)) {
                event_patch.start = { date_time: event_patch.start.format() };
            }
            if (!_.isEmpty(event_patch.end)) {
                event_patch.end = { date_time: event_patch.end.format() };
            }
        }
        console.log(event_patch);

        this.props.dispatch(set_dirty_selected_event(false));
        // TODO: need to find a better way to do this flow
        let action = null;
        if (this.props.creating) {
            const layer_id = this.state.editing_event.layer_id;
            action = _.partial(async_create_event, layer_id, event_patch);
        } else {
            action = _.partial(async_save_event, this.props.id, event_patch);
        }

        // If there was no invitee at the start of the edit and it stayed that way,
        // there is no point in asking to notify anyone
        // TODO: this can be improved?
        if (_.isEmpty(this.state.editing_event.attendees) &&
            _.isEmpty(_.get(this.props.event, 'attendees', []))) {
            this.props.dispatch(action(false)).catch(fetch_error);
        } else {
            $('#attendee-notification-modal').data('action', action).foundation('open');
        }
    }

    toggle_subtooltip(subtooltip_id) {
        // We're always toggling between `attendees`, `description` or `remidners` and `main`
        if (this.state.subtooltip !== 'main') {
            subtooltip_id = 'main'; // eslint-disable-line no-param-reassign
        }

        this.setState({
            subtooltip: subtooltip_id,
            focused_input: this.state.subtooltip,
        });
    }

    _render_subtooltip() {
        switch (this.state.subtooltip) {
        case 'description':
            return (
                <DescriptionSubTooltip
                  description={this.state.editing_event.description}
                  on_change={this._on_change}
                  toggle_subtooltip={this.toggle_subtooltip.description}
                />
            );
        case 'attendees':
            return (
                <AttendeeSubTooltip
                  attendees={this.state.editing_event.attendees}
                  layer_id={this.state.editing_event.layer_id}
                  on_change={this._on_change}
                  toggle_subtooltip={this.toggle_subtooltip.attendees}
                />
            );
        case 'reminders':
            return (
                <ReminderSubTooltip
                  reminders={this.state.editing_event.reminders}
                  on_change={this._on_change}
                  toggle_subtooltip={this.toggle_subtooltip.reminders}
                />
            );
        case 'main':
            return (
                <MainSubTooltip
                  creating={this.props.creating}
                  create_able_sources={this.props.create_able_sources}
                  event={this.state.editing_event}
                  layer={this.props.layer}
                  toggle_subtooltip={this.toggle_subtooltip}
                  on_input_blur={this._on_input_blur}
                  on_change={this._on_change}
                  on_input_focus={this._on_input_focus}
                  on_submit={this.save_edit}
                  focused_input={this.state.focused_input}
                />
            );
        default:
            return null;
        }
    }

    render() {
        return (
            <ReactCSSTransitionGroup
              component="div"
              className="edit-tooltip"
              transitionName="subtooltip"
              transitionEnterTimeout={250}
              transitionLeaveTimeout={250}
            >
                <div
                  className="subtooltip"
                  key={this.state.subtooltip}
                  data-direction={this.state.subtooltip === 'main' ? 'left' : 'right'}
                >
                    {this._render_subtooltip()}
                </div>
            </ReactCSSTransitionGroup>
        );
    }
}

EditableEventTooltip.propTypes = {
    event: event_prop_type,
    layer: layer_prop_type,
    creating: React.PropTypes.bool,
    dirty: React.PropTypes.bool,
    dispatch: React.PropTypes.func,
    id: React.PropTypes.string,
    create_able_sources: React.PropTypes.objectOf(expanded_source_prop_type),
};


const map_state_props = (state) => {
    const create_able_sources = get_create_able_sources(state);
    return {
        create_able_sources,
    };
};


const EditableEventTooltipContainer = connect(map_state_props)(EditableEventTooltip);
export default EditableEventTooltipContainer;
