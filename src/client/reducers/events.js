/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import update from 'react/lib/update';
import _ from 'lodash';


const reducer = (events = {}, action) => {
    switch (action.type) {
    case 'ADD_EVENTS':
    case 'PATCH_EVENTS':
        return update(
            events,
            {
                $merge: _.keyBy(action.events, 'id'),
            }
        );
    case 'DELETE_EVENTS':
        return _.omit(events, action.ids);
    default:
        return events;
    }
};


export default reducer;
