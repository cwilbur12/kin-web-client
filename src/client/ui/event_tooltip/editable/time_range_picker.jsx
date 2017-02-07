/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import moment from 'moment-timezone';
import React from 'react';
import TimeInput from 'time-input';

import { moment_prop_types } from '../../../prop_types';
import { user_config } from '../../../utils';


export default class TimeRangePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = this._time_strings_from_props(props);

        this._on_end_input_change = this._on_end_input_change.bind(this);
        this._on_start_input_change = this._on_start_input_change.bind(this);
    }

    componentWillReceiveProps(next_props) {
        this.setState(this._time_strings_from_props(next_props));
    }

    _time_strings_from_props(props) {
        // TODO: fix this, time-input silences any input
        const output = {
            start_time: props.start !== null ? props.start.format(props.time_format) : '',
            end_time: props.end !== null ? props.end.format(props.time_format) : '',
        };
        return output;
    }

    _set_raw_time(moment_obj, raw_time, time_format = this.props.time_format) {
        // TODO: transform this into a real moment plugin?
        // This creates a moment object now but with the right time parsed
        const time = moment.tz(raw_time, time_format, true, user_config.timezone);
        if (!time.isValid()) {
            return moment.invalid();
        }

        // Let's add each time component on the moment_obj
        const moment_obj_copy = moment(moment_obj);
        moment_obj_copy.set({
            hour: time.get('hour'),
            minute: time.get('minute'),
        });
        return moment_obj_copy;
    }

    _on_start_input_change(value) {
        const dates = {};
        dates.start = this._set_raw_time(this.props.start, value);
        if (dates.start.isValid()) {
            if (this.props.end !== null) {
                const duration = this.props.end.diff(this.props.start);
                dates.end = moment(dates.start).add(duration);
            }
            this.props.on_dates_change(dates);
        } else {
            this.setState({ start_time: value });
        }
    }

    _on_end_input_change(value) {
        // TODO: add support for error "range empty" etc ...
        const dates = {};
        dates.end = this._set_raw_time(this.props.end, value);
        if (dates.end.isValid()) {
            this.props.on_dates_change(dates);
        } else {
            this.setState({ end_time: value });
        }
    }

    render() {
        return (
            <div>
                <TimeInput
                  value={this.state.start_time}
                  onChange={this._on_start_input_change}
                />
                <TimeInput
                  value={this.state.end_time}
                  onChange={this._on_end_input_change}
                />
            </div>
        );
    }
}


TimeRangePicker.defaultProps = {
    end: null,
    start: null,
};


TimeRangePicker.propTypes = {
    end: moment_prop_types.momentObject,
    on_dates_change: React.PropTypes.func,
    start: moment_prop_types.momentObject,
    time_format: React.PropTypes.string,
};
