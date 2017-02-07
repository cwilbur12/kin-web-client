/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import bluebird from 'bluebird';
import _ from 'lodash';

import { async_load_events } from './events';


const POLLING_LOOP_STEP = 5 * 60;


export const async_refresh_layers = () => {
    return (dispatch, get_state) => {
        const state = get_state();
        const promises = [];

        _(state.layers).filter('selected').forEach((layer) => {
            const promise = dispatch(async_load_events(layer.id));
            promises.push(promise);
        });

        return bluebird.all(promises);
    };
};


let _polling_interval_id = null;
export const start_polling_loop = () => {
    return (dispatch) => {
        if (!_.isNull(_polling_interval_id)) {
            console.warn('Bowing out from starting polling daemon, one is already running');
            return;
        }

        console.log('Launching polling daemon with a step of %ds', POLLING_LOOP_STEP);
        _polling_interval_id = setInterval(() => {
            console.debug('Polling for new events');
            dispatch(async_refresh_layers());
        }, POLLING_LOOP_STEP * 1000);
    };
};
