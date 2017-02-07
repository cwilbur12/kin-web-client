/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import moment from 'moment-timezone';


export function toggle_color_picker_tooltip(toggle = null) {
    return {
        type: 'TOGGLE_COLOR_PICKER_TOOLTIP',
        toggle
    };
}


export function toggle_timezone_selector_tooltip(toggle = null) {
    return {
        // TODO: have a TOGGLE action with more information in the action
        // instead of demultiplying the actions?
        type: 'TOGGLE_TIMEZONE_SELECTOR_TOOLTIP',
        toggle
    };
}


export function update_full_calendar_view(view) {
    return {
        type: 'UPDATE_FULL_CALENDAR_VIEW',
        view,
    };
}


export function get_full_calendar_view($calendar = $('#calendar')) {
    const view = $calendar.fullCalendar('getView');
    const start = view.intervalStart;
    const end = moment(view.intervalEnd).subtract(1, 'day');
    return {
        name: view.name,
        params: { start, end },
    };
}
