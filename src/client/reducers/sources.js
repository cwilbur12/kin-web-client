/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import update from 'react/lib/update';
import _ from 'lodash';

import { split_merged_id } from '../utils';


const reducer = (sources = {}, action) => {
    switch (action.type) {
    case 'ADD_SOURCES':
        _.forEach(action.sources, (source) => {
            source.layers = []; // eslint-disable-line no-param-reassign
        });
        return update(
            sources,
            {
                $merge: _.keyBy(action.sources, 'id'),
            }
        );
    case 'PATCH_SOURCE':
        return update(
            sources,
            {
                [action.id]: {
                    $merge: action.patch,
                },
            }
        );
    case 'DELETE_SOURCES':
        return _.pickBy(sources, source => action.ids.indexOf(source.id) === -1);
    case 'ADD_LAYERS': {
        const sources_update = {};
        _.forEach(action.layers, (layer) => {
            const [source_id, ] = split_merged_id(layer.id); // eslint-disable-line array-bracket-spacing
            if (!(source_id in sources_update)) {
                sources_update[source_id] = {
                    layers: {
                        $push: [],
                    },
                };
            }
            sources_update[source_id].layers.$push.push(layer.id);
        });
        return update(sources, sources_update);
    }
    default:
        return sources;
    }
};


export default reducer;
