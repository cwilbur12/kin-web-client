/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import update from 'react/lib/update';


const default_ui_state = {
    timezone_selector_tooltip: {
        show: false,
        target: null,
    },
    color_picker_tooltip: {
        show: false,
    },
    full_calendar: {
        view: {
            name: null,
            params: {},
        },
    },
};


export default function reducer(ui = default_ui_state, action) {
    switch (action.type) {
    case 'TOGGLE_COLOR_PICKER_TOOLTIP': {
        const current = ui.color_picker_tooltip.show;
        const toggle = (action.toggle === null) ? !current : action.toggle;
        if (toggle === current) {
            return ui;
        }

        return update(
            ui,
            {
                $merge: {
                    color_picker_tooltip: {
                        show: toggle,
                    },
                }
            }
        );
    }
    case 'TOGGLE_TIMEZONE_SELECTOR_TOOLTIP': {
        const current = ui.timezone_selector_tooltip.show;
        const toggle = (action.toggle === null) ? !current : action.toggle;
        if (toggle === current) {
            return ui;
        }

        const target = document.getElementsByClassName('calendar-toolbar__timezone')[0];
        return update(
            ui,
            {
                $merge: {
                    timezone_selector_tooltip: {
                        show: toggle,
                        target,
                    },
                }
            }
        );
    }
    case 'UPDATE_FULL_CALENDAR_VIEW': {
        return update(
            ui,
            {
                $merge: {
                    full_calendar: {
                        view: action.view,
                    },
                },
            }
        );
    }
    default:
        return ui;
    }
}
