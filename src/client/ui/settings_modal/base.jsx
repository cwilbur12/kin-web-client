/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';
import { connect } from 'react-redux';

import { expanded_source_prop_type, source_prop_type } from '../../prop_types';
import { get_create_able_sources } from '../../utils';
import { async_logout_user } from '../../actions/user';
import SettingsModalSettingsTab from './settings_tab';
import SettingsModalSourcesTab from './sources_tab';
import SettingsModalNotificationsTab from './notifications_tab';


class SettingsModal extends React.Component {
    constructor() {
        super();
        this.close_modal = this.close_modal.bind(this);
        this.logout_user = this.logout_user.bind(this);
    }

    componentDidMount() {
        new Foundation.Reveal($(this.modal)); // eslint-disable-line no-new, no-undef
        new Foundation.Tabs($(this.tabs)); // eslint-disable-line no-new, no-undef
    }

    close_modal() {
        $(this.modal).foundation('close');
    }

    logout_user() {
        this.props.dispatch(async_logout_user());
    }

    render() {
        return (
            <div
              ref={(ref) => { this.modal = ref; }}
              id="settings-modal"
              className="reveal"
              data-reveal
            >
                <ul
                  ref={(ref) => { this.tabs = ref; }}
                  id="settings-tabs"
                  className="tabs row"
                  data-tabs
                >
                    <li className="tabs-title is-active small-3 columns">
                        <a href="#settings-preferences">
                            <div className="fa fa-cog icon" />
                            Preferences
                        </a>
                    </li>
                    <li className="tabs-title small-3 columns">
                        <a href="#settings-accounts">
                            <div className="fa fa-users icon" />
                            Accounts
                        </a>
                    </li>
                    <li className="tabs-title small-3 columns">
                        <a href="#settings-notifications">
                            <div className="fa fa-bell icon" />
                            Notifications
                        </a>
                    </li>
                </ul>

                <div className="tabs-content" data-tabs-content="settings-tabs">
                    <SettingsModalSettingsTab
                      create_able_sources={this.props.create_able_sources}
                      dispatch={this.props.dispatch}
                    />

                    <SettingsModalSourcesTab
                      sources={this.props.sources}
                      dispatch={this.props.dispatch}
                    />

                    <SettingsModalNotificationsTab
                      dispatch={this.props.dispatch}
                    />
                </div>

                <footer>
                    <a
                      className="button small alert float-left"
                      onClick={this.logout_user}
                    >
                        Logout
                    </a>
                    <a
                      className="button small secondary close-button float-right"
                      onClick={this.close_modal}
                    >
                        Done
                    </a>
                    <div className="clearfix" />
                </footer>
            </div>
        );
    }
}


SettingsModal.propTypes = {
    dispatch: React.PropTypes.func,
    create_able_sources: React.PropTypes.objectOf(expanded_source_prop_type),
    sources: React.PropTypes.objectOf(source_prop_type),
};


const map_state_props = (state) => {
    const create_able_sources = get_create_able_sources(state);
    return {
        create_able_sources,
        sources: state.sources,
    };
};


const SettingsModalContainer = connect(map_state_props)(SettingsModal);
export default SettingsModalContainer;
