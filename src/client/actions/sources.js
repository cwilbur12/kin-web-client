/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import 'whatwg-fetch';
import _ from 'lodash';

import { api_url, fetch_options, fetch_check, location_redirect,
         split_source_id } from '../utils';


export const add_sources = (sources) => {
    return {
        type: 'ADD_SOURCES',
        sources,
    };
};


export const patch_source = (id, patch) => {
    return {
        type: 'PATCH_SOURCE',
        id,
        patch,
    };
};


export const delete_sources = (ids) => {
    return {
        type: 'DELETE_SOURCES',
        ids,
    };
};


export const async_load_sources = () => {
    return (dispatch) => {
        return fetch(api_url('/sources'), fetch_options())
            .then(_.partial(fetch_check, dispatch))
            .then((json_res) => {
                _.forEach(json_res.sources, (source) => {
                    source.loaded = false; // eslint-disable-line no-param-reassign
                });
                dispatch(add_sources(json_res.sources));
            });
    };
};


export const async_deauth_source = (source_id) => {
    return (dispatch) => {
        const { provider_name } = split_source_id(source_id);
        return fetch(api_url(`/source/${provider_name}/deauth/${source_id}`), fetch_options())
            .then(_.partial(fetch_check, dispatch))
            .then((res_json) => {
                location_redirect(res_json.redirect);
            });
    };
};
