/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import update from 'react/lib/update';
import _ from 'lodash';

import { merge_ids, split_merged_id } from '../utils';


const reducer = (layers = {}, action) => {
    switch (action.type) {
    case 'ADD_LAYERS':
        _.forEach(action.layers, (layer) => {
            layer.events = []; // eslint-disable-line no-param-reassign
        });
        return update(
            layers,
            {
                $merge: _.keyBy(action.layers, 'id'),
            }
        );
    case 'PATCH_LAYER':
        return update(
            layers,
            {
                [action.id]: {
                    $merge: action.patch,
                },
            }
        );
    case 'ADD_EVENTS': {
        if (action.creating) {
            return layers;
        }

        // TODO: both `ADD_EVENTS` and `DELETE_EVENTS` have very similar structure:
        // - extract the event ids from the action
        // - group by those event ids by their respective layer id
        // - create a layer update object
        const layers_update = _(action.events)
            .map('id')
            .groupBy((event_id) => {
                const [source_id, short_layer_id, ] = split_merged_id(event_id); // eslint-disable-line array-bracket-spacing
                const layer_id = merge_ids(source_id, short_layer_id);
                return layer_id;
            })
            .mapValues((ids, layer_id) => {
                return {
                    $merge: {
                        events: _.union(layers[layer_id].events, ids),
                    },
                };
            })
            .value();

        return update(layers, layers_update);
    }
    case 'DELETE_EVENTS': {
        const layers_update = _(action.ids)
            .groupBy((event_id) => {
                const [source_id, short_layer_id, ] = split_merged_id(event_id); // eslint-disable-line array-bracket-spacing
                const layer_id = merge_ids(source_id, short_layer_id);
                return layer_id;
            })
            .mapValues((ids, layer_id) => {
                return {
                    $merge: {
                        events: _.difference(layers[layer_id].events, ids),
                    },
                };
            })
            .value();

        return update(layers, layers_update);
    }
    default:
        return layers;
    }
};


export default reducer;
