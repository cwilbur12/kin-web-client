/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import bluebird from 'bluebird';
import moment from 'moment-timezone';
import querystring from 'querystring';
import React from 'react';
import Perf from 'react-addons-perf';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import thunk from 'redux-thunk';
import _ from 'lodash';

import { rollbar_config } from './config';
import { fetch_error, location_redirect, setup_message_popup,
    template_hide_loader_spinners, template_show_roots, user_config } from './utils';

import App from './ui/app';
import Calendar from './calendar';

import { start_notification_loop } from './actions/notifications';
import { start_polling_loop } from './actions/polling';
import { async_load_sources } from './actions/sources';
import { async_load_layers } from './actions/layers';
import { get_full_calendar_view, update_full_calendar_view } from './actions/ui';
import { async_load_user } from './actions/user';

import reducer from './reducers';

window.Perf = Perf;


const Rollbar = require('./rollbar.umd.nojson.min.js').init(rollbar_config);

require('./foundation');
require('../public/styles/main.scss');


function extract_token_from_hash() {
    if (!_.isEmpty(window.location.hash)) {
        const hash = querystring.parse(window.location.hash.substr(1));
        if (!_.isEmpty(hash.token)) {
            user_config.token = hash.token;
        }
        window.location.hash = '';
    }
}


function create_redux_store(...middlewares) {
    const enhancers = _.map(middlewares, middleware => applyMiddleware(middleware));
    if (window.devToolsExtension) {
        enhancers.push(window.devToolsExtension());
    }
    return createStore(reducer, compose.apply(window, enhancers));
}


function guess_timezone() {
    if (_.isEmpty(user_config.timezone)) {
        const guessed_timezone = moment.tz.guess();
        console.log('guessed timezone: %s', guessed_timezone);
        user_config.timezone = guessed_timezone;
    }
}


function init_full_sync(fc_calendar, store) {
    template_hide_loader_spinners();
    template_show_roots();

    fc_calendar.create($('#calendar'), store);
    fc_calendar.bind_events();
    fc_calendar.resize();
    store.dispatch(update_full_calendar_view(get_full_calendar_view()));

    store.dispatch(async_load_sources())
         .then(() => {
             const state = store.getState();
             _(state.sources)
                .filter(source => source.status !== 'disconnected')
                .forEach((source) => {
                    // TODO: catch error?
                    store.dispatch(async_load_layers(source.id));
                });
         })
         .catch(fetch_error);

    if (user_config.notification_permission === 'granted') {
        store.dispatch(start_notification_loop());
    }
    store.dispatch(start_polling_loop());
}


function main() {
    extract_token_from_hash();
    if (!user_config.authenticated) {
        location_redirect('./auth.html');
        return;
    }
    setup_message_popup();
    guess_timezone();

    const fc_calendar = new Calendar();
    const store = create_redux_store(thunk, fc_calendar.middleware.bind(fc_calendar));

    const _render_promise = new Promise((resolve) => {
        const root_element = document.getElementsByClassName('root')[0];
        render(
            <Provider store={store}>
                <App />
            </Provider>,
            root_element,
            resolve
        );
    });
    const _async_load_user = store.dispatch(async_load_user());
    bluebird
        .all([_render_promise, _async_load_user])
        .then(init_full_sync.bind(undefined, fc_calendar, store))
        .catch((err) => {
            // TODO: we should have a util abstracting this, handling not
            // hitting rollbar in dev
            console.error(err);
            Rollbar.error(err);
        });
}


if (KIN_ENV_NAME === 'prod') {
    try {
        main();
    } catch (err) {
        Rollbar.error(err);
    }
} else {
    main();
}
