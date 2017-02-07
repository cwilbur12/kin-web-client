/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import Push from 'push.js';
import _ from 'lodash';

import { user_config } from '../utils';

const notification_icon = require('../../public/imgs/logo/logo@3x.png');


const NOTIFICATION_LOOP_STEP = 60;
let _notification_interval_id = null;


export const stop_notification_loop = () => {
    return () => {
        console.log('Stopping notification daemon');
        window.clearInterval(_notification_interval_id);
        _notification_interval_id = null;
    };
};


export const start_notification_loop = () => {
    return (dispatch, get_state) => {
        if (!_.isNull(_notification_interval_id)) {
            console.warn('Bowing out from starting notification daemon, one is already running');
            return;
        }

        const current_date = new Date();
        let previous_loop_time = current_date.valueOf();

        function _notification_loop() {
            const notification_permission = user_config.notification_permission;
            if (notification_permission !== 'granted') {
                console.warn('Stoping notification daemon due to insufficient permissions: %s',
                             notification_permission);
                dispatch(stop_notification_loop());
            }

            const current_loop_time = new Date().valueOf();
            const events = get_state().events;
            _(events).forEach((event) => {
                _(event.reminders).forEach((reminder) => {
                    const reminder_time = event.start.valueOf() - (reminder.minutes * 60 * 1000);
                    if (reminder_time > previous_loop_time && reminder_time <= current_loop_time) {
                        // TODO: need to move to a better display of time
                        const notification_title = _.isEmpty(event.title) ? 'No Event Title' : event.title;
                        Push.create(notification_title, {
                            body: `in ${reminder.minutes} minutes`,
                            icon: notification_icon,
                        });
                    }
                });
            });
            previous_loop_time = current_loop_time;
        }

        // Offset to be "on the minute"
        const initial_offset = 60 - current_date.getSeconds();
        _notification_interval_id = window.setTimeout(() => {
            console.log('Notification daemon launched with a step of %ds', NOTIFICATION_LOOP_STEP);
            _notification_loop();
            _notification_interval_id = window.setInterval(
                _notification_loop, NOTIFICATION_LOOP_STEP * 1000);
        }, initial_offset * 1000);
        console.log('Launching notification daemon with an initial offset of %ds', initial_offset);
    };
};
