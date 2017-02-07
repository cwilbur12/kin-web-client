/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import { combineReducers } from 'redux';

import events_reducer from './events';
import layers_reducer from './layers';
import sources_reducer from './sources';
import selected_event_reducer from './selected_event';
import ui_reducer from './ui';


const reducer = combineReducers({
    sources: sources_reducer,
    layers: layers_reducer,
    events: events_reducer,
    selected_event: selected_event_reducer,
    ui: ui_reducer,
});


export default reducer;
