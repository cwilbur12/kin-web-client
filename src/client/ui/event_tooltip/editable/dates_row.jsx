/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import moment from 'moment-timezone';
import React from 'react';
import { DateRangePicker } from 'react-dates';
import _ from 'lodash';

import { moment_prop_types } from '../../../prop_types';
import { user_config } from '../../../utils';
import TimeRangePicker from './time_range_picker';


export default class DatesRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            focused_input: null,
        };

        this._on_picker_dates_change = this._on_picker_dates_change.bind(this);
        this._on_dates_change = this._on_dates_change.bind(this);
        this._on_focus_change = this._on_focus_change.bind(this);
        this._on_all_day_change = this._on_all_day_change.bind(this);
    }

    _on_picker_dates_change(dates) {
        // This is separated from `on_dates_change` to preserve times and
        // convert from `react-dates`'s naming: `startDate`, `endDate` to our
        // internal: `start`, `end`.
        if (!_.isNil(dates.startDate) && this.props.start !== null) {
            dates.startDate.set({
                hour: this.props.start.get('hour'),
                minute: this.props.start.get('minute'),
            });
        }

        if (!_.isNil(dates.endDate) && this.props.end !== null) {
            dates.endDate.set({
                hour: this.props.end.get('hour'),
                minute: this.props.end.get('minute'),
            });
        }

        this._on_dates_change({
            start: dates.startDate,
            end: dates.endDate,
        });
    }

    _on_dates_change(dates_patch) {
        // Sanitize patch + business logic to comply with the standard of saving
        // all-day events with an inclusive end date
        const dates = _.omitBy(dates_patch, _.isNil);

        if (this.props.all_day && !_.isNil(dates.end)) {
            dates.end.add(1, 'day');
        }

        this.props.on_dates_change(dates);
    }

    _on_focus_change(focused_input) {
        this.setState({ focused_input });
    }

    _on_all_day_change(react_event) {
        // This is to compensate for the inclusiveness or not of the
        // "end date" in all-day events
        const dates_changes = {
            all_day: react_event.target.checked,
        };
        if (this.props.end !== null) {
            const end = moment(this.props.end);
            if (this.props.all_day) {
                end.subtract(1, 'day');
            } else {
                end.add(1, 'day');
            }
            dates_changes.end = end;
        }
        this.props.on_dates_change(dates_changes);
    }

    render() {
        const start = this.props.start;
        const end = (this.props.all_day && this.props.end !== null)
            ? moment(this.props.end).subtract(1, 'day')
            : this.props.end;

        // TODO: this is ugly as fuck
        const time_format = user_config.time_format === 'h:mm A' ? 'hh:mm A' : user_config.time_format;

        const date_range_picker_props = {
            displayFormat: user_config.date_format,
            focusedInput: this.state.focused_input,
            horizontalMargin: 100,
            isOutsideRange: () => false,
            minimumNights: 0,
            numberOfMonths: 1,
            onDatesChange: this._on_picker_dates_change,
            onFocusChange: this._on_focus_change,
        };

        const time_range_picker_props = {
            on_dates_change: this._on_dates_change,
            time_format,
        };

        if (start !== null) {
            date_range_picker_props.startDate = start;
            time_range_picker_props.start = start;
        }

        if (end !== null) {
            date_range_picker_props.endDate = end;
            time_range_picker_props.end = end;
        }

        return (
            <section className="dates-row">
                <div className="dates-row__date-time-inputs">
                    <DateRangePicker {...date_range_picker_props} />
                    <br />
                    <div className={classnames({ hide: this.props.all_day })}>
                        <TimeRangePicker {...time_range_picker_props} />
                    </div>
                </div>
                <div className="dates-row__all-day-checkbox">
                    <label
                      htmlFor="all-day-checkbox"
                      className={classnames({ focused: this.props.all_day_focused })}
                    >
                        All Day<br />
                        <input
                          id="all-day-checkbox"
                          type="checkbox"
                          checked={this.props.all_day}
                          onBlur={this.props.on_all_day_blur}
                          onChange={this._on_all_day_change}
                          onFocus={this.props.on_all_day_focus}
                        /><br />
                    </label>
                </div>
            </section>
        );
    }
}


DatesRow.propTypes = {
    all_day: React.PropTypes.bool,
    all_day_focused: React.PropTypes.bool,
    start: moment_prop_types.momentObject,
    end: moment_prop_types.momentObject,

    on_dates_change: React.PropTypes.func,
    on_all_day_blur: React.PropTypes.func,
    on_all_day_focus: React.PropTypes.func,
};
