/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';

import { deselect_event, set_dirty_selected_event } from '../../actions/events';


export default class LeaveEditModeModal extends React.Component {
    constructor() {
        super();
        this.close_modal = this.close_modal.bind(this);
        this.leave_edit_mode = this.leave_edit_mode.bind(this);
    }

    componentDidMount() {
        new Foundation.Reveal($(this.modal)); // eslint-disable-line no-new, no-undef
    }

    close_modal() {
        $(this.modal).foundation('close');
    }

    leave_edit_mode() {
        $(this.modal).foundation('close');
        this.props.dispatch(set_dirty_selected_event(false));
        this.props.dispatch(deselect_event());
    }

    render() {
        return (
            <div
              ref={(ref) => { this.modal = ref; }}
              id="leave-edit-mode-modal"
              className="reveal"
              data-reveal data-close-on-click="false" data-close-on-esc="false"
            >
                <header>
                    <h4>Are you sure you want to leave?</h4>
                    <em>Your event has not been saved.</em>
                </header>
                <div className="button-group text-center callout">
                    <a
                      className="primary button expanded"
                      onClick={this.close_modal}
                    >
                        Stay on edit mode
                    </a>
                    <a
                      className="secondary button expanded"
                      onClick={this.leave_edit_mode}
                    >
                        Leave edit mode
                    </a>
                </div>
            </div>
        );
    }
}


LeaveEditModeModal.propTypes = {
    dispatch: React.PropTypes.func,
};
