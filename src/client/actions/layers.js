/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import 'whatwg-fetch';
import _ from 'lodash';

import { api_url, fetch_check, fetch_error, fetch_options } from '../utils';
import { async_load_events, deselect_event } from './events';
import { patch_source } from './sources';


export const add_layers = (layers) => {
    // `layer` NEEDs to contain a valid layer id
    return {
        type: 'ADD_LAYERS',
        layers,
    };
};


export const patch_layer = (id, patch) => {
    return {
        type: 'PATCH_LAYER',
        id,
        patch,
    };
};


export const async_load_layers = (source_id) => {
    return (dispatch) => {
        return fetch(
            api_url(`/sources/${escape(source_id)}/layers`),
            fetch_options()
        )
            .then(_.partial(fetch_check, dispatch))
            .then((json_res) => {
                _.forEach(json_res.layers, (layer) => {
                    layer.loaded = false; // eslint-disable-line no-param-reassign
                    if (layer.selected) {
                        dispatch(async_load_events(layer.id)).catch(fetch_error);
                    }
                });
                dispatch(add_layers(json_res.layers));
                dispatch(patch_source(source_id, {
                    loaded: true,
                }));
            });
    };
};


const async_patch_layer = (layer_id, layer_patch) => {
    return (dispatch) => {
        return fetch(
            api_url(`/layers/${escape(layer_id)}`),
            fetch_options({
                method: 'PATCH',
                body: JSON.stringify(layer_patch),
            })
        )
            .then(_.partial(fetch_check, dispatch))
            .then((json_res) => {
                console.log('synced patch `%o` for layer `%s` status: `%s`',
                            layer_patch, layer_id, json_res);
                if (layer_patch.selected === false) {
                    dispatch(deselect_event());
                     // Unload layer here if we're deselecting it
                    layer_patch.loaded = false; // eslint-disable-line no-param-reassign
                    layer_patch.events = []; // eslint-disable-line no-param-reassign
                }
                dispatch(patch_layer(layer_id, layer_patch));
            });
    };
};


export const async_toggle_selected_layer = (layer_id, is_selected) => {
    const layer_patch = {
        selected: is_selected,
    };
    if (!is_selected) {
        layer_patch.sync_token = null;
    }
    return async_patch_layer(layer_id, layer_patch);
};
