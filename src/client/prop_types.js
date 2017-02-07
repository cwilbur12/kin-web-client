/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import moment from 'moment-timezone';
import React from 'react';
import _ from 'lodash';


export const moment_prop_types = {
    momentObject: (props, prop_name, component_name) => {
        const prop_value = props[prop_name];
        if (_.isEmpty(prop_value)) { // accept empty
            return null;
        }

        if (!moment.isMoment(prop_value)) {
            return new Error(`Invalid prop \`${prop_name}\` supplied to \`${component_name}\`: \`${prop_value}\`. Validation failed`);
        }

        return null;
    },
};


export const attendee_prop_type = React.PropTypes.shape({
    email: React.PropTypes.string,
    response_status: React.PropTypes.oneOf([
        'needs_action', 'declined', 'tentative', 'accepted']),
    self: React.PropTypes.bool,
});


export const reminder_prop_type = React.PropTypes.shape({
    minutes: React.PropTypes.number,
});


const event_id_prop_type = React.PropTypes.string;
export const event_prop_type = React.PropTypes.shape({
    id: event_id_prop_type,
    title: React.PropTypes.string,
    status: React.PropTypes.oneOf(['confirmed']),
    description: React.PropTypes.string,
    location: React.PropTypes.string,
    all_day: React.PropTypes.bool,
    start: moment_prop_types.momentObject,
    end: moment_prop_types.momentObject,
    attendees: React.PropTypes.arrayOf(attendee_prop_type),
    reminders: React.PropTypes.arrayOf(reminder_prop_type),
    kind: React.PropTypes.oneOf(['event#basic']),
});


const layer_id_prop_type = React.PropTypes.string;
export const layer_prop_type = React.PropTypes.shape({
    id: layer_id_prop_type,
    events: React.PropTypes.arrayOf(layer_id_prop_type),
    title: React.PropTypes.string,
    acl: React.PropTypes.shape({
        create: React.PropTypes.bool,
        edit: React.PropTypes.bool,
        delete: React.PropTypes.bool,
    }),
    color: React.PropTypes.string,
    text_color: React.PropTypes.string,
    selected: React.PropTypes.bool,
    loaded: React.PropTypes.bool,
    sync_token: React.PropTypes.string,
});


const base_source_shape = {
    // id: React.PropTypes.string,
    id: React.PropTypes.string,
    layers: React.PropTypes.arrayOf(layer_id_prop_type),
    display_name: React.PropTypes.string,
    email: React.PropTypes.string,
    status: React.PropTypes.oneOf(['connected', 'refreshing', 'disconnected']),
    colors: React.PropTypes.object,
    loaded: React.PropTypes.bool,
};
export const source_prop_type = React.PropTypes.shape(base_source_shape);


export const expanded_source_prop_type = React.PropTypes.shape(
    _.merge({}, base_source_shape, {
        layers: React.PropTypes.objectOf(layer_prop_type),
    })
);


export const color_prop_type = React.PropTypes.shape({
    background: React.PropTypes.string,
    foreground: React.PropTypes.string,
});
