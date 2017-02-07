/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import _ from 'lodash';

import { is_ios, KinConnectorError, parse_params, redirect_to_API,
    send_oauth_code_to_API, validate_params } from './utils';
import { template_hide_loader_spinners, template_show_roots } from '../utils';
import { rollbar_config } from '../config';


const Rollbar = require('../rollbar.umd.nojson.min.js').init(rollbar_config);


require('../../public/styles/connector.scss');


function _show_error(err) {
    template_hide_loader_spinners();
    template_show_roots();

    $('.connector-error-text').html(err.message);
    return false;
}


function _error_handler(err) {
    _show_error(err);
    Rollbar.error(err);
}


function _insert_template() {
    const template = `
        <div class="connector-error-text"></div>
        <em>please retry later</em><br/>
        <a href="/" class="connector-back-link">Back to Kin</a>`;
    $('.root').html(template);
}


try {
    _insert_template();

    if (is_ios) {
        $('.connector-back-link').hide();
    }
    const search = window.location.search.substr(1);
    const hash = window.location.hash.substr(1);
    const params = parse_params(search, hash);

    if (!_.isEmpty(params.error)) {
        throw new KinConnectorError(params.error);
    }

    if (!validate_params(params)) {
        throw new KinConnectorError('bad parameters (role / provider)');
    }

    if (!_.isEmpty(params.redirect)) {
        $('.loader-text').html('Redirecting ...');
        redirect_to_API(params);
    } else {
        $('.loader-text').html('Connecting ...');
        send_oauth_code_to_API(params)
            .then(() => {
                $('.loader-text').html('Redirecting ...');
            })
            .catch(_error_handler);
    }
} catch (err) {
    _error_handler(err);
}
