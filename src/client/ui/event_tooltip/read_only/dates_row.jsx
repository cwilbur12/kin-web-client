/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import moment from 'moment-timezone';
import React from 'react';
import _ from 'lodash';

import { moment_prop_types } from '../../../prop_types';
import { user_config } from '../../../utils';


export default class DatesRow extends React.Component {
    /**
     * Output:
     *
     * no date
     */
    _no_date_render() {
        // TODO: there is a similar style in edit subtooltips (no reminders, no invitees)?
        return (
            <div className="dates-row row">
                <div className="small-12 columns">
                    <em>no date</em>
                </div>
            </div>
        );
    }

    /**
     * Outputs:
     *
     * Monday, Dec 12th 2016  10:00
     * no end date
     *
     * OR
     *
     * no start date
     * Monday, Dec 12th 2016  10:00
     */
    _partial_render() {
        const _format_prop = (prop_name) => {
            const value = this.props[prop_name];
            if (_.isEmpty(value)) {
                // TODO: there is a similar style in edit subtooltips (no reminders, no invitees)?
                return (
                    <div className="small-12 columns">
                        <em>no {prop_name} date</em>
                    </div>
                );
            }
            return (
                <div className="small-12 columns">
                    {this._format_date(prop_name)}
                    {this._time_cell(value, this.props.all_day)}
                </div>
            );
        };

        return (
            <div className="dates-row row">
                {_format_prop('start')}
                {_format_prop('end')}
            </div>
        );
    }

    /**
     * Output:
     *
     * Monday, Dec 12th 2016  10:00   1 day
     * Tuesday, Dec 12th 2016  10:00
     */
    _verbose_render() {
        return (
            <div className="dates-row row">
                <div className="datetimes-wrapper">
                    <p>
                        {this._format_date('start')}
                        &nbsp;
                        {this._time_cell(this.props.start, this.props.all_day)}
                    </p>
                    <p>
                        {this._format_date('end')}
                        &nbsp;
                        {this._time_cell(this.props.end, this.props.all_day)}
                    </p>
                </div>
                <div className="duration-wrapper">
                    <em>{this.props.start.from(this.props.end, true)}</em>
                </div>
            </div>
        );
    }

    /**
     * Output:
     *
     * Monday, Dec 12th 2016  2 hours
     * 10:00 -> 12:00
     */
    _shortcut_render() {
        return (
            <div className="dates-row row">
                <div className="datetimes-wrapper">
                    <p>
                        {this._format_date('start')}
                    </p>
                    <p>
                        {this._time_cell(this.props.start, this.props.all_day)}
                        &nbsp;&rarr;&nbsp;
                        {this._time_cell(this.props.end, this.props.all_day)}
                    </p>
                </div>
                <div className="duration-wrapper">
                    <em>{this.props.start.from(this.props.end, true)}</em>
                </div>
            </div>
        );
    }

    _format_date(prop_name) {
        let value = this.props[prop_name];
        if (this.props.all_day && prop_name === 'end') {
            // In all-day mode, the end day is "inclusive":
            // An event stored as Fri 1 00:00 -> Sun 3 00:00 should be displayed ass Fri 1 -> Sat 2
            value = moment(value).subtract(1, 'day');
        }
        return (
            <span className="date-cell">
                {value.format('dddd, MMM Do YYYY')}
            </span>
        );
    }

    _format_time(value) {
        return value.format(user_config.time_format);
    }

    _time_cell(value, hide = true) {
        if (hide) {
            return null;
        }
        return (
            <span className="time-cell">
                {this._format_time(value)}
            </span>
        );
    }

    render() {
        const empty_start = _.isEmpty(this.props.start);
        const empty_end = _.isEmpty(this.props.end);
        if (empty_start && empty_end) {
            return this._no_date_render();
        }
        if (empty_start || empty_end) {
            return this._partial_render();
        }
        if (this.props.start.isSame(this.props.end, 'day')) {
            return this._shortcut_render();
        }
        return this._verbose_render();
    }
}


DatesRow.propTypes = {
    all_day: React.PropTypes.bool,
    start: moment_prop_types.momentObject,
    end: moment_prop_types.momentObject,
};
