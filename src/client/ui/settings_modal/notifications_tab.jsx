/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';

import { user_config } from '../../utils';
import { start_notification_loop, stop_notification_loop } from '../../actions/notifications';


export default class SettingsModalNotificationsTab extends React.Component {
    constructor() {
        super();
        this.disable_notifications = this.disable_notifications.bind(this);
        this.try_enabling_notifications = this.try_enabling_notifications.bind(this);
    }

    disable_notifications() {
        user_config.disable_notification();
        this.forceUpdate();
        this.props.dispatch(stop_notification_loop());
    }

    try_enabling_notifications() {
        // TODO: unsupported?
        user_config.enable_notification(
            () => {
                // granted
                this.props.dispatch(start_notification_loop());
                this.forceUpdate();
            },
            () => {
                // denied
                this.forceUpdate();
            }
        );
    }

    render() {
        return (
            <div className="tabs-panel" id="settings-notifications">
                <p className="text-center">
                    {(() => {
                        switch (user_config.notification_permission) {
                        case 'granted':
                            return (
                                <span>
                                    <br />
                                    <a
                                      className="button alert"
                                      onClick={this.disable_notifications}
                                    >
                                        Disable Notifications
                                    </a>
                                </span>
                            );
                        case 'default':
                            return (
                                <a
                                  className="button primary"
                                  onClick={this.try_enabling_notifications}
                                >
                                    Enable Notifications
                                </a>
                            );
                        case 'denied':
                            return 'Please allow your browser to use notifications';
                        case 'unsupported':
                        default:
                            return 'Notifications not supported by your browser';
                        }
                    })()}
                </p>
            </div>
        );
    }
}

SettingsModalNotificationsTab.propTypes = {
    dispatch: React.PropTypes.func,
};
