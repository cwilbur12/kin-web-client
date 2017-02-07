/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';
import _ from 'lodash';

import { expanded_source_prop_type } from '../../prop_types';
import { split_source_id, user_config } from '../../utils';
import { async_patch_user } from '../../actions/user';
import { async_refresh_layers } from '../../actions/polling';


export default class SettingsModalSettingsTab extends React.Component {
    constructor() {
        super();
        this.refresh_layers = this.refresh_layers.bind(this);
        this.select_first_day = this.select_first_day.bind(this);
        this.select_date_format = this.select_date_format.bind(this);
        this.select_time_format = this.select_time_format.bind(this);
        this.select_default_calendar_id = this.select_default_calendar_id.bind(this);
    }

    refresh_layers() {
        const $button = $(this.refresh_button);
        $button.addClass('disabled');
        this.props
            .dispatch(async_refresh_layers())
            .then(() => {
                $button.removeClass('disabled');
            })
            .catch(() => {
                $button.removeClass('disabled');
            });
    }

    select_first_day(event) {
        const first_day = parseInt($(event.target).val(), 10);
        this.props.dispatch(async_patch_user({
            first_day,
        }));
    }

    select_time_format(event) {
        const time_format = $(event.target).val();
        user_config.time_format = time_format;
        window.location.reload();
    }

    select_date_format(event) {
        const date_format = $(event.target).val();
        user_config.date_format = date_format;
        window.location.reload();
    }

    select_default_calendar_id(js_event) {
        const default_calendar_id = $(js_event.target).val();
        this.props.dispatch(async_patch_user({
            default_calendar_id,
        }));
    }

    render() {
        return (
            <div className="tabs-panel is-active" id="settings-preferences">
                <p className="text-center">
                    <button
                      ref={(ref) => { this.refresh_button = ref; }}
                      className="button primary"
                      onClick={this.refresh_layers}
                    >
                        <span className="fa fa-refresh" />&nbsp;
                        Refresh
                    </button>
                </p>

                <table>
                    <tbody>
                        <tr>
                            <td>
                                <label htmlFor="settings-first-day" className="text-right">
                                    Week start on
                                </label>
                            </td>
                            <td>
                                <select
                                  id="settings-first-day"
                                  onChange={this.select_first_day}
                                  defaultValue={user_config.first_day}
                                >
                                    {(() => {
                                        const first_days = [
                                            {
                                                value: 1,
                                                name: 'Monday'
                                            },
                                            {
                                                value: 0,
                                                name: 'Sunday',
                                            },
                                            {
                                                value: 6,
                                                name: 'Saturday',
                                            },
                                        ];
                                        return _.map(first_days, (day) => {
                                            return (
                                                <option value={day.value} key={day.value}>
                                                    {day.name}
                                                </option>
                                            );
                                        });
                                    })()}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="settings-date-format" className="text-right">
                                    Date format
                                </label>
                            </td>
                            <td>
                                <select
                                  id="settings-date-format"
                                  onChange={this.select_date_format}
                                  defaultValue={user_config.date_format}
                                >
                                    {(() => {
                                        const date_formats = [
                                            {
                                                value: 'ddd D MMM',
                                                name: 'Tue 4 Oct',
                                            },
                                            {
                                                value: 'ddd M/D',
                                                name: 'Tue 10/4',
                                            },
                                        ];
                                        return _.map(date_formats, (date_format) => {
                                            return (
                                                <option
                                                  key={date_format.value}
                                                  value={date_format.value}
                                                >
                                                    {date_format.name}
                                                </option>
                                            );
                                        });
                                    })()}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="settings-time-format" className="text-right">
                                    Time format
                                </label>
                            </td>
                            <td>
                                <select
                                  id="settings-time-format"
                                  onChange={this.select_time_format}
                                  defaultValue={user_config.time_format}
                                >
                                    {(() => {
                                        const time_formats = [
                                            {
                                                value: 'h:mm A',
                                                name: '1:00 PM'
                                            },
                                            {
                                                value: 'HH:mm',
                                                name: '13:00',
                                            },
                                        ];
                                        return _.map(time_formats, (time_format) => {
                                            return (
                                                <option
                                                  key={time_format.value}
                                                  value={time_format.value}
                                                >
                                                    {time_format.name}
                                                </option>
                                            );
                                        });
                                    })()}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label
                                  htmlFor="settings-default-calendar-id"
                                  className="text-right"
                                >
                                    Default Calendar
                                </label>
                            </td>
                            <td>
                                <select
                                  id="settings-default-calendar-id"
                                  onChange={this.select_default_calendar_id}
                                  value={user_config.default_calendar_id}
                                >
                                    {_.map(this.props.create_able_sources, (source) => {
                                        const { provider_name } = split_source_id(source.id);
                                        return (
                                            <optgroup label={`${provider_name} - ${source.email}`} key={source.id}>
                                                {_.map(source.layers, (layer) => {
                                                    return (
                                                        <option
                                                          value={layer.id}
                                                          key={layer.id}
                                                        >
                                                            {layer.title}
                                                        </option>
                                                    );
                                                })}
                                            </optgroup>
                                        );
                                    })}
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}


SettingsModalSettingsTab.propTypes = {
    dispatch: React.PropTypes.func,
    create_able_sources: React.PropTypes.objectOf(expanded_source_prop_type),
};
