/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';
import _ from 'lodash';

import { attendee_prop_type } from '../../../prop_types';
import {
    api_url, fetch_check, fetch_options, split_merged_id,

    ATTENDEE_BG_COLORS, hash_code, rsvp_icons,
} from '../../../utils';
import DetailsSubTooltip from './details_sub_tooltip';


export default class AttendeeSubTooltip extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
        };

        this.autocomplete = this.autocomplete.bind(this);
        this.debounced_autocomplete = _.debounce(this.autocomplete, 200);
        this.clean_autocomplete_results = this.clean_autocomplete_results.bind(this);
        this.select_contact = this.select_contact.bind(this);
        this.delete_attendee = this.delete_attendee.bind(this);
        this.invite_attendee = this.invite_attendee.bind(this);
    }

    _render_results() {
        if (_.isEmpty(this.state.results)) {
            return null;
        }

        return (
            <div className="autocompletor-results">
                <table>
                    <tbody>
                        {_.map(this.state.results, (contact) => {
                            return (
                                <tr
                                  key={contact.id}
                                  data-value={contact.email}
                                  onMouseDown={this.select_contact}
                                >
                                    <td>
                                        {contact.email}&nbsp;
                                        <em>{contact.display_name}</em>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

    _try_inviting_attendee(email) {
        if (_.isEmpty(email)) {
            return;
        }

        const found = _.find(this.props.attendees, { email });
        if (_.isUndefined(found)) {
            this.props.on_change({
                attendees: [{
                    email,
                    response_status: 'needs_action',
                }, ...this.props.attendees],
            });
            $(this.event_attendee_input).val('');
            this.clean_autocomplete_results();
        }
    }

    get new_attendee_value() {
        return this.event_attendee_input.value;
    }

    set new_attendee_value(new_attendee_value) {
        this.event_attendee_input.value = new_attendee_value;
    }

    autocomplete() {
        if (_.isEmpty(this.new_attendee_value)) {
            this.clean_autocomplete_results();
        } else {
            // TODO: do we have layer_id?
            const [source_id, ] = split_merged_id(this.props.layer_id); // eslint-disable-line array-bracket-spacing
            const input = this.new_attendee_value;
            const url = api_url(
                `/sources/${escape(source_id)}/contacts`,
                { input }
            );
            fetch(url, fetch_options())
                .then(_.partial(fetch_check, {}))
                .then((json_res) => {
                    this.setState({
                        results: _.get(json_res, 'contacts', []),
                    });
                });
        }
    }

    clean_autocomplete_results() {
        this.setState({
            results: [],
        });
    }

    select_contact(event) {
        const contact_email = $(event.target).closest('tr').data('value');
        this._try_inviting_attendee(contact_email);
    }

    delete_attendee(event) {
        const email = $(event.target).closest('tr[data-email]').data('email');
        this.props.on_change({
            attendees: _.differenceBy(this.props.attendees, [{ email }], 'email'),
        });
    }

    invite_attendee(event) {
        event.preventDefault();
        const email = this.new_attendee_value;
        this._try_inviting_attendee(email);
    }

    render() {
        return (
            <DetailsSubTooltip
              title="People"
              toggle_subtooltip={this.props.toggle_subtooltip}
            >
                <div className="attendee-subtooltip">
                    <form
                      onBlur={this.clean_autocomplete_results}
                      onSubmit={this.invite_attendee}
                    >
                        <button type="submit" className="secondary button small float-right">
                            Invite
                        </button>
                        <label htmlFor="event-new-attendee-input">
                            <input
                              id="event-new-attendee-input"
                              type="email"
                              placeholder="Email"
                              onChange={this.debounced_autocomplete}
                              autoFocus
                              ref={(ref) => { this.event_attendee_input = ref; }}
                            />
                            {this._render_results()}
                        </label>
                    </form>

                    <div className="attendee-subtooltip-content">
                        <AttendeeList
                          attendees={this.props.attendees}
                          delete_attendee={this.delete_attendee}
                        />
                    </div>
                </div>
            </DetailsSubTooltip>
        );
    }
}

AttendeeSubTooltip.propTypes = {
    attendees: React.PropTypes.arrayOf(attendee_prop_type),
    layer_id: React.PropTypes.string,
    on_change: React.PropTypes.func,
    toggle_subtooltip: React.PropTypes.func,
};


// TODO: should definitely be shared with read-only's AttendeesRow
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


const AttendeeList = (props) => {
    if (_.isEmpty(props.attendees)) {
        return (
            <h6>
                <br />
                <em className="empty-list-label">no invitee yet</em>
            </h6>
        );
    }
    return (
        <table className="hover">
            <tbody>
                {_.map(props.attendees, (attendee) => {
                    return (
                        <tr key={attendee.email} data-email={attendee.email}>
                            <th>
                                <AttendeeCell
                                  key={attendee.email}
                                  attendee={attendee}
                                />
                            </th>
                            <td>
                                <p className="constrained">
                                    {attendee.email}
                                </p>
                            </td>
                            <th>
                                <button
                                  className="button tiny alert"
                                  onClick={props.delete_attendee}
                                >
                                    <span className="fa fa-trash" />
                                </button>
                            </th>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};


AttendeeList.propTypes = {
    attendees: React.PropTypes.arrayOf(attendee_prop_type),
    delete_attendee: React.PropTypes.func,
};
