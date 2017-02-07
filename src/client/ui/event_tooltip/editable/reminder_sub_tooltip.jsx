/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import moment from 'moment-timezone';
import React from 'react';
import _ from 'lodash';

import { reminder_prop_type } from '../../../prop_types';
import DetailsSubTooltip from './details_sub_tooltip';


export default class ReminderSubTooltip extends React.Component {
    constructor(props) {
        super(props);
        this.add_reminder = this.add_reminder.bind(this);
        this.remove_reminder = this.remove_reminder.bind(this);
    }

    get available_reminders() {
        return _.differenceBy([
            { minutes: 2 },
            { minutes: 5 },
            { minutes: 10 },
            { minutes: 30 },
            { minutes: 60 },
            { minutes: 2 * 60 },
            { minutes: 12 * 60 },
            { minutes: 24 * 60 },
            { minutes: 2 * 24 * 60 },
            { minutes: 7 * 24 * 60 },
        ], this.props.reminders, 'minutes');
    }

    remove_reminder(event) {
        const minutes = $(event.target).closest('tr[data-reminder-minutes]').data('reminder-minutes');
        this.props.on_change({
            reminders: _.differenceBy(this.props.reminders, [{ minutes }], 'minutes'),
        });
    }

    add_reminder(event) {
        event.preventDefault();
        const $select = $(this.event_reminder_select);
        const reminder_minutes = parseInt($select.val(), 10);

        const is_dupplicate = _.find(
            this.props.reminders, { minutes: reminder_minutes }) !== undefined;

        if (reminder_minutes !== 'noop' && !is_dupplicate) {
            this.props.on_change({
                reminders: _.sortBy(
                    [{
                        minutes: reminder_minutes,
                    }, ...this.props.reminders],
                    'minutes'
                ),
            });
        }
    }

    render() {
        return (
            <DetailsSubTooltip
              title="Alerts"
              toggle_subtooltip={this.props.toggle_subtooltip}
            >
                <div className="reminder-subtooltip">
                    <form onSubmit={this.add_reminder}>
                        <select
                          ref={(ref) => { this.event_reminder_select = ref; }}
                          onChange={this.add_reminder}
                          autoFocus
                        >
                            <option value="noop">Add a new alert</option>
                            {_.map(this.available_reminders, (reminder) => {
                                return (
                                    <option key={reminder.minutes} value={reminder.minutes}>
                                        {moment().add(reminder.minutes, 'minute').fromNow(true)} before event
                                    </option>
                                );
                            })}
                        </select>
                    </form>

                    <div className="reminder-subtooltip-content">
                        <ReminderList
                          reminders={this.props.reminders}
                          remove_reminder={this.remove_reminder}
                        />
                    </div>
                </div>
            </DetailsSubTooltip>
        );
    }
}


ReminderSubTooltip.propTypes = {
    reminders: React.PropTypes.arrayOf(reminder_prop_type),
    on_change: React.PropTypes.func,
    toggle_subtooltip: React.PropTypes.func,
};


const ReminderList = (props) => {
    if (_.isEmpty(props.reminders)) {
        return (
            <h6>
                <br />
                <em className="empty-list-label">no alert yet</em>
            </h6>
        );
    }

    return (
        <table className="hover">
            <tbody>
                {_.map(props.reminders, (reminder) => {
                    return (
                        <tr key={reminder.minutes} data-reminder-minutes={reminder.minutes}>
                            <td colSpan="2">
                                {moment().add(reminder.minutes, 'minute').fromNow(true)} before event
                            </td>
                            <th>
                                <button
                                  className="button tiny alert"
                                  onClick={props.remove_reminder}
                                >
                                    <span className="fa fa-trash" />
                                </button>
                            </th>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};


ReminderList.propTypes = {
    remove_reminder: React.PropTypes.func,
    reminders: React.PropTypes.arrayOf(reminder_prop_type),
};
