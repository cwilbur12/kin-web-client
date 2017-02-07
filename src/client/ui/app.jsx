/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';
import { connect } from 'react-redux';

import { EVENTS_NS } from '../config';
import { user_config } from '../utils';

import { deselect_event } from '../actions/events';
import CalendarToolbar from './calendar_toolbar';
import EventTooltip from './event_tooltip/base';
import SettingsModal from './settings_modal/base';
import SourcesList from './sources_list';


class App extends React.Component {
    constructor(props) {
        super(props);
        this.keydown_handler = this.keydown_handler.bind(this);
        this.open_settings_modal = this.open_settings_modal.bind(this);
        this.toggle_sidebar = this.toggle_sidebar.bind(this);
    }

    componentDidMount() {
        $(document).on(`keydown.${EVENTS_NS}`, this.keydown_handler);
        this._update_sidebar();
    }

    componentWillUnMount() {
        $(document).off(`keydown.${EVENTS_NS}`);
    }

    keydown_handler(event) {
        if (event.which === 27) {
            this.props.dispatch(deselect_event());
        }
    }

    open_settings_modal(event) {
        event.preventDefault();
        $('#settings-modal').foundation('open');
    }

    toggle_sidebar(event) {
        event.preventDefault();
        const collapsed = user_config.is_collapsed('kin:menu');
        user_config.set_collapsed('kin:menu', !collapsed);
        this._update_sidebar();
    }

    _update_sidebar() {
        const collapsed = user_config.is_collapsed('kin:menu');
        $('aside').toggle(!collapsed);
        $('.content').toggleClass('margin', !collapsed);
        $('.calendar-toolbar').toggleClass('margin', collapsed);
    }

    render() {
        return (
            <div>
                <div className="logo" onClick={this.toggle_sidebar} />
                <aside>
                    <div>
                        <a
                          href="#settings-modal"
                          className="float-right settings-button"
                          onClick={this.open_settings_modal}
                        >
                            <span className="fa fa-cog" />
                        </a>
                    </div>
                    <div className="clearfix" />
                    <SourcesList />
                </aside>

                <div className="content margin">
                    <EventTooltip />
                    <SettingsModal />
                    <CalendarToolbar />
                    <div id="calendar" />
                </div>
            </div>
        );
    }
}

App.propTypes = {
    dispatch: React.PropTypes.func,
};


const AppContainer = connect()(App);
export default AppContainer;
