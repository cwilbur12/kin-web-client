/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import moment from 'moment-timezone';
import React from 'react';
import { connect } from 'react-redux';

import KinTooltip from './kin_tooltip';
import TimezoneSelector from './timezone_selector/timezone_selector';

import { fetch_error, user_config } from '../utils';
import { deselect_event } from '../actions/events';
import { get_full_calendar_view, toggle_timezone_selector_tooltip, update_full_calendar_view } from '../actions/ui';
import { async_patch_user } from '../actions/user';


const left_chevron = require('../../public/imgs/icons/left_chevron.png');
const right_chevron = require('../../public/imgs/icons/right_chevron.png');


class CalendarToolbar extends React.Component {
    constructor() {
        super();

        this._next = this._next.bind(this);
        this._prev = this._prev.bind(this);
        this._hide_timezone_tooltip = this._hide_timezone_tooltip.bind(this);
        this._show_timezone_tooltip = this._show_timezone_tooltip.bind(this);
        this._today = this._today.bind(this);
        this._update_full_calendar_view = this._update_full_calendar_view.bind(this);
        this._view_switch = this._view_switch.bind(this);
    }

    get _$calendar() {
        return $('#calendar');
    }

    _update_full_calendar_view() {
        this.props.dispatch(
            update_full_calendar_view(get_full_calendar_view()));
    }

    _next() {
        this.props.dispatch(deselect_event());
        this._$calendar.fullCalendar('next');
        this._update_full_calendar_view();
    }

    _prev() {
        this.props.dispatch(deselect_event());
        this._$calendar.fullCalendar('prev');
        this._update_full_calendar_view();
    }

    _hide_timezone_tooltip() {
        this.props.dispatch(toggle_timezone_selector_tooltip(false));
    }

    _show_timezone_tooltip() {
        this.props.dispatch(toggle_timezone_selector_tooltip(true));
    }

    _today() {
        this._$calendar.fullCalendar('today');
        this._update_full_calendar_view();
    }

    _view_switch() {
        if (this.props.dispatch(deselect_event())) {
            const next_view = (this.props.full_calendar.view.name === 'month') ? 'agendaWeek' : 'month';
            const $fc_view_container = this._$calendar.find('.fc-view-container');
            const $prev_fc_view = this._$calendar.find('.fc-view');
            const $fc_view_dup = $prev_fc_view.clone().appendTo($fc_view_container);

            $fc_view_dup.find('.fc-scroller').scrollTop($prev_fc_view.find('.fc-scroller').scrollTop());

            // TODO: move this in the action?
            this._$calendar.fullCalendar('changeView', next_view);
            this._update_full_calendar_view();

            // TODO: move this to update_full_calendar_view?
            this.props
                .dispatch(
                    async_patch_user({
                        default_view: next_view,
                    }, false)
                )
                .catch(fetch_error);

            const $fc_view = this._$calendar.find('.fc-view').addClass('show-animation');
            $fc_view_dup.addClass('hide-animation');
            setTimeout(() => {
                $fc_view.addClass('show-animation-active active');
                $fc_view_dup.addClass('hide-animation-active active');
            }, 1);

            setTimeout(() => {
                $fc_view_dup.remove();
                $fc_view.removeClass('show-animation show-animation-active');
            }, 200);
        }
    }

    _render_view_title() {
        switch (this.props.full_calendar.view.name) {
        case 'agendaWeek': {
            const start = this.props.full_calendar.view.params.start;
            const end = this.props.full_calendar.view.params.end;
            return (
                <span>
                    <strong>{start.format('MMM')}</strong> {start.format('D')}
                    &nbsp;-&nbsp;
                    <strong>{end.format('MMM')}</strong> {end.format('D')}
                </span>
            );
        }
        case 'month': {
            const start = this.props.full_calendar.view.params.start;
            return (
                <span>
                    <strong>{start.format('MMMM')}</strong> {start.format('YYYY')}
                </span>
            );
        }
        default:
            return null;
        }
    }

    render() {
        const current_time = moment.tz(user_config.timezone);

        const is_month = (this.props.full_calendar.view.name === 'month');
        const view_switch_classes = classnames('fa', 'view-switch', {
            'fa-th': !is_month,
            'fa-bars': is_month,
        });

        const target = (this.props.timezone_tooltip_show) ? this._timezone_tooltip_target : null;

        return (
            <div className="calendar-toolbar">
                <div className="float-left">
                    <button
                      className="button calendar-toolbar__timezone"
                      ref={(ref) => { this._timezone_tooltip_target = ref; }}
                      onClick={this._show_timezone_tooltip}
                    >
                        {current_time.zoneAbbr()}
                    </button>
                    <button
                      className="button"
                      onClick={this._today}
                    >
                        today
                    </button>
                    <button
                      className="button"
                      onClick={this._prev}
                    >
                        <img
                          className="chevron-icon"
                          src={left_chevron}
                          alt="Left chevron icon"
                        />
                    </button>
                    <button
                      className="button"
                      onClick={this._next}
                    >
                        <img
                          className="chevron-icon"
                          src={right_chevron}
                          alt="Right chevron icon"
                        />
                    </button>
                </div>
                <div className="float-right">
                    <div className="calendar-toolbar__title">
                        {this._render_view_title()}
                    </div>
                    <button
                      className="button"
                      onClick={this._view_switch}
                    >
                        <span className={view_switch_classes} />
                    </button>
                </div>
                <KinTooltip
                  on_close={this._hide_timezone_tooltip}
                  root_classes={['timezone-selector-tooltip']}
                  target={target}
                >
                    <TimezoneSelector dispatch={this.props.dispatch} />
                </KinTooltip>
            </div>
        );
    }
}


CalendarToolbar.propTypes = {
    dispatch: React.PropTypes.func,
    full_calendar: React.PropTypes.shape({
        status: React.PropTypes.string,
        view: React.PropTypes.shape({
            name: React.PropTypes.strng,
            params: React.PropTypes.object,
        })
    }),
    timezone_tooltip_show: React.PropTypes.bool,
};


function map_state_props(state) {
    return {
        full_calendar: state.ui.full_calendar,
        timezone_tooltip_show: state.ui.timezone_selector_tooltip.show,
    };
}


const CalendarToolbarContainer = connect(map_state_props)(CalendarToolbar);
export default CalendarToolbarContainer;
