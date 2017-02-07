/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import moment from 'moment-timezone';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { user_config } from '../../utils';
import { async_patch_user } from '../../actions/user';
import TimezoneAutoCompletor from './timezone_auto_completor';
import TimezoneRow from './timezone_row';


class TimezoneSelector extends React.Component {
    constructor() {
        super();

        this.select_timezone = this.select_timezone.bind(this);

        this._default_timezones = [
            'America/Los_Angeles', 'America/New_York',
            'Europe/London', 'Europe/Paris',
        ];
        if (this._default_timezones.indexOf(user_config.timezone) === -1) {
            this._default_timezones.push(user_config.timezone);
        }
        this._timezones = _.difference(moment.tz.names(), this._default_timezones);
    }

    select_timezone(event) {
        const timezone_full_name = $(event.target).closest('tr').data('value');
        this.props.dispatch(async_patch_user({
            timezone: timezone_full_name,
        }));
    }

    render() {
        return (
            <div className="timezone-selector">
                <table>
                    <tbody>
                        {_.map(this._default_timezones, (timezone) => {
                            return (
                                <TimezoneRow
                                  key={timezone}
                                  timezone={timezone}
                                  select_timezone={this.select_timezone}
                                />
                            );
                        })}
                    </tbody>
                </table>

                <TimezoneAutoCompletor
                  timezones={this._timezones}
                  select_timezone={this.select_timezone}
                />
            </div>
        );
    }
}

TimezoneSelector.propTypes = {
    dispatch: React.PropTypes.func,
};


const TimezoneSelectorContainer = connect()(TimezoneSelector);
export default TimezoneSelectorContainer;
