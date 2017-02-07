/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';
import _ from 'lodash';

import { attendee_prop_type } from '../../../prop_types';
import { ATTENDEE_BG_COLORS, hash_code, rsvp_icons } from '../../../utils';


const AttendeeCell = (props) => {
    const email_hash = hash_code(props.attendee.email);
    const color = ATTENDEE_BG_COLORS[email_hash % ATTENDEE_BG_COLORS.length];
    return (
        <div key={props.attendee.email} className="avatar">
            <a
              target="_blank"
              href={`mailto:${props.attendee.email}`}
              title={props.attendee.email}
              rel="noopener noreferrer"
            >
                <img
                  className="avatar-rsvp"
                  src={rsvp_icons[props.attendee.response_status]}
                  alt={`Attendee RSVP: ${props.attendee.response_status}`}
                />
                <div className="avatar-bg" style={{ background: color }}>
                    {props.attendee.email.charAt(0).toUpperCase()}
                </div>
            </a>
        </div>
    );
};
AttendeeCell.propTypes = {
    attendee: attendee_prop_type,
};


export default class AttendeesRow extends React.Component {
    render() {
        if (!_.isEmpty(this.props.attendees)) {
            return (
                <div className="attendees-row row small-up-8 constrained">
                    {_.map(this.props.attendees, (attendee) => {
                        return (
                            <div className="columns" key={attendee.email}>
                                <AttendeeCell attendee={attendee} />
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    }
}

AttendeesRow.propTypes = {
    attendees: React.PropTypes.arrayOf(attendee_prop_type),
};
