/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import React from 'react';
import _ from 'lodash';

import { event_prop_type, expanded_source_prop_type, layer_prop_type } from '../../../prop_types';
import AttendeeRow from './attendee_row';
import DatesRow from './dates_row';
import DescriptionRow from './description_row';
import LayerRow from './layer_row';
import LocationRow from './location_row';
import ReminderRow from './reminder_row';


export default class MainSubTooltip extends React.Component {
    constructor(props) {
        super(props);

        this._on_change = {
            title: this._on_input_change.bind(this, 'title'),
            layer_id: this._on_input_change.bind(this, 'layer_id'),
            dates: this._on_dates_change.bind(this),
            location: this._on_raw_change.bind(this, 'location'),
        };

        this._on_focus = {
            title: props.on_input_focus.bind(this, 'title'),
            layer_id: props.on_input_focus.bind(this, 'layer_id'),
            all_day: props.on_input_focus.bind(this, 'all_day'),
            location: props.on_input_focus.bind(this, 'location'),
        };

        this._on_blur = {
            title: props.on_input_blur.bind(this, 'title'),
            layer_id: props.on_input_blur.bind(this, 'layer_id'),
            all_day: props.on_input_blur.bind(this, 'all_day'),
            location: props.on_input_blur.bind(this, 'location'),
        };
    }

    _on_dates_change(dates) {
        this.props.on_change(_.pick(dates, ['start', 'end', 'all_day']));
    }

    _on_raw_change(prop_name, value) {
        this.props.on_change({
            [prop_name]: value,
        });
    }

    _on_input_change(prop_name, react_event) {
        this.props.on_change({
            [prop_name]: react_event.target.value,
        });
    }

    render() {
        // TODO: incorporate this in the layerRow?
        const header_style = {
            background: 'white',
            borderBottom: (!this.props.creating ? (
                `3px solid ${_.get(this.props.layer, 'color', 'transparent')}`
            ) : '0px'),
        };
        const is_title_focused = this.props.focused_input === 'title';
        return (
            <div>
                <header style={header_style}>
                    <label
                      htmlFor="event-title-input"
                      className={classnames({ focused: is_title_focused })}
                    >
                        Event Title
                    </label>
                    <input
                      id="event-title-input"
                      type="text"
                      value={this.props.event.title}
                      onBlur={this._on_blur.title}
                      onChange={this._on_change.title}
                      onFocus={this._on_focus.title}
                      placeholder="Type a title"
                      autoFocus={is_title_focused}
                    />
                </header>
                <div>
                    <LayerRow
                      layer_id={this.props.event.layer_id}
                      creating={this.props.creating}
                      create_able_sources={this.props.create_able_sources}
                      on_blur={this._on_blur.layer_id}
                      on_change={this._on_change.layer_id}
                      on_focus={this._on_focus.layer_id}
                      focused={this.props.focused_input === 'layer_id'}
                    />
                    <DatesRow
                      start={this.props.event.start}
                      end={this.props.event.end}
                      all_day={this.props.event.all_day}
                      on_dates_change={this._on_change.dates}
                      on_all_day_blur={this._on_blur.all_day}
                      on_all_day_focus={this._on_focus.all_day}
                      all_day_focused={this.props.focused_input === 'all_day'}
                    />
                    <LocationRow
                      layer_id={this.props.event.layer_id}
                      location={this.props.event.location}
                      on_blur={this._on_blur.location}
                      on_change={this._on_change.location}
                      on_focus={this._on_focus.location}
                      focused={this.props.focused_input === 'location'}
                    />
                    <AttendeeRow
                      attendees={this.props.event.attendees}
                      open={this.props.toggle_subtooltip.attendees}
                      focused={this.props.focused_input === 'attendees'}
                    />
                    <DescriptionRow
                      description={this.props.event.description}
                      open={this.props.toggle_subtooltip.description}
                      focused={this.props.focused_input === 'description'}
                    />
                    <ReminderRow
                      reminders={this.props.event.reminders}
                      open={this.props.toggle_subtooltip.reminders}
                      focused={this.props.focused_input === 'reminders'}
                    />
                </div>
                <footer>
                    <button
                      onClick={this.props.on_submit}
                      className="primary button small float-right"
                    >
                        {(this.props.creating) ? 'Create' : 'Save'}
                    </button>
                    <div className="clearfix" />
                </footer>
            </div>
        );
    }
}


MainSubTooltip.propTypes = {
    creating: React.PropTypes.bool,

    // TODO: add a "strict" prop type with every field required? + add `layer_id`
    event: event_prop_type,
    layer: layer_prop_type,

    create_able_sources: React.PropTypes.objectOf(expanded_source_prop_type),
    focused_input: React.PropTypes.string,

    on_input_blur: React.PropTypes.func.isRequired,
    on_input_focus: React.PropTypes.func.isRequired,
    on_change: React.PropTypes.func.isRequired,
    on_submit: React.PropTypes.func.isRequired,
    toggle_subtooltip: React.PropTypes.objectOf(React.PropTypes.func),
};
