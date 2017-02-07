/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import { connect } from 'react-redux';
import React from 'react';

import { fetch_error } from '../../utils';
import { async_delete_event } from '../../actions/events';


class EventDeletionModal extends React.Component {
    constructor() {
        super();
        this.delete_event = this.delete_event.bind(this);
        this.close_modal = this.close_modal.bind(this);
    }

    componentDidMount() {
        new Foundation.Reveal($(this.modal)); // eslint-disable-line no-new, no-undef
    }

    delete_event() {
        const $modal = $(this.modal);
        $modal.foundation('close');
        const event_id = $modal.data('event-id');
        this.props.dispatch(async_delete_event(event_id))
            .catch(fetch_error);
    }

    close_modal() {
        const $modal = $(this.modal);
        $modal.foundation('close');
    }

    render() {
        return (
            <div
              ref={(ref) => { this.modal = ref; }}
              className="reveal"
              id="event-deletion-modal"
              data-reveal
              data-close-on-click="false"
              data-close-on-esc="false"
            >
                <header>
                    <h4>Are you sure?</h4>
                    <em>There is no undo ... yet</em>
                </header>
                <div className="button-group text-center callout">
                    <a
                      className="alert button expanded"
                      onClick={this.delete_event}
                    >
                        Delete event
                    </a>
                    <a
                      className="secondary button expanded"
                      onClick={this.close_modal}
                    >
                        Cancel
                    </a>
                </div>
            </div>
        );
    }
}


EventDeletionModal.propTypes = {
    dispatch: React.PropTypes.func,
};


const EventDeletionModalContainer = connect()(EventDeletionModal);
export default EventDeletionModalContainer;
