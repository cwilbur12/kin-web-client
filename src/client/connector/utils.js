/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import 'whatwg-fetch';
import querystring from 'querystring';
import _ from 'lodash';

import { api_url, fetch_options, location_redirect, user_config } from '../utils';


export const is_ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;


export function KinConnectorError(message) {
    this.name = 'KinConnectorError';
    this.message = message;
}
KinConnectorError.constructor = new Error();


export const ALLOWED_PARAMS = [
    { role: 'authentication', provider: 'facebook' },
    { role: 'authentication', provider: 'google' },

    { role: 'source', provider: 'eventbrite' },
    { role: 'source', provider: 'facebook' },
    { role: 'source', provider: 'github' },
    { role: 'source', provider: 'google' },
    { role: 'source', provider: 'meetup' },
    { role: 'source', provider: 'outlook' },
    { role: 'source', provider: 'todoist' },
    { role: 'source', provider: 'trello' },
    { role: 'source', provider: 'wunderlist' },
];


export function parse_params(...query_strings) {
    return querystring.parse(_.join(query_strings, '&'));
}


export function redirect_to_API(params) {
    if (_.isEmpty(params.token)) {
        throw new KinConnectorError('missing token (hash / query string)');
    }
    user_config.token = params.token;

    location_redirect(api_url(
        `/${params.role}/${params.provider}`,
        {
            token: user_config.token,
        }
    ));
}

export function send_oauth_code_to_API(params) {
    return fetch(
        api_url(`/${params.role}/${params.provider}/callback?${querystring.stringify(params)}`),
        fetch_options()
    )
        .then((response) => {
            if (response.ok) {
                return response.json();
            }

            const error = new Error(response.statusText || response.status);
            error.response = response;
            throw error;
        })
        .then((res_json) => {
            // TODO: Add a default redirection in case of false iOS detection?
            if (is_ios) {
                location_redirect(res_json.ios_redirect);
            } else {
                location_redirect(res_json.redirect);
            }
        });
}

export function validate_params(params) {
    const found = _.find(ALLOWED_PARAMS, {
        role: params.role,
        provider: params.provider,
    });
    return !_.isUndefined(found);
}
