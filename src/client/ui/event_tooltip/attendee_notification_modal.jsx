/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import { connect } from 'react-redux';
import React from 'react';


class AttendeeNotificationModal extends React.Component {
    constructor() {
        super();
        this.send = this._save_event.bind(this, true);
        this.dont_send = this._save_event.bind(this, false);
    }

    componentDidMount() {
        new Foundation.Reveal($(this.modal)); // eslint-disable-line no-new, no-undef
    }

    _save_event(notify_attendees = false) {
        const $modal = $(this.modal);
        $modal.foundation('close');
        const action = $modal.data('action');
        this.props.dispatch(action(notify_attendees));
    }

    render() {
        return (
            <div
              ref={(ref) => { this.modal = ref; }}
              id="attendee-notification-modal"
              className="reveal"
              data-reveal
              data-close-on-click="false"
              data-close-on-esc="false"
            >
                <header>
                    <h4>Notify other guests?</h4>
                    <em>You&apos;ve updated this event</em>
                </header>
                <div className="button-group text-center callout">
                    <a
                      className="primary button expanded"
                      onClick={this.send}
                    >
                        Send
                    </a>
                    <a
                      className="secondary button expanded"
                      onClick={this.dont_send}
                    >
                        Don&apos;t send
                    </a>
                </div>
            </div>
        );
    }
}


AttendeeNotificationModal.propTypes = {
    dispatch: React.PropTypes.func,
};


const AttendeeNotificationModalContainer = connect()(AttendeeNotificationModal);
export default AttendeeNotificationModalContainer;
