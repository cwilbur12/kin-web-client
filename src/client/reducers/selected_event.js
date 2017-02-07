/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import update from 'react/lib/update';
import _ from 'lodash';


const default_selected_event = {
    id: null,
    editing: false,
    creating: false,
    dirty: false,
};

const reducer = (selected_event = default_selected_event, action) => {
    switch (action.type) {
    case 'SELECT_EVENT':
        if (_.isNull(selected_event.id) || action.id !== selected_event.id || action.force) {
            return {
                id: action.id,
                creating: action.creating,

                // Those two gets tru-ish only when creating, otherwise they are
                // triggered by user actions
                editing: action.creating,
                dirty: false,
            };
        }
        return selected_event;
    case 'TOGGLE_EDIT_SELECTED_EVENT':
        return update(
            selected_event,
            { $merge: { editing: !selected_event.editing } }
        );
    case 'SET_DIRTY_SELECTED_EVENT':
        return update(
            selected_event,
            { $merge: { dirty: action.dirty } }
        );
    case 'DESELECT_EVENT':
        return _.merge({}, default_selected_event);
    default:
        return selected_event;
    }
};


export default reducer;
