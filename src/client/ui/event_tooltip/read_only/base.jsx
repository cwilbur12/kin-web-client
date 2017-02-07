/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import { connect } from 'react-redux';
import React from 'react';
import _ from 'lodash';

import { color_prop_type, event_prop_type, layer_prop_type } from '../../../prop_types';
import { fetch_error } from '../../../utils';
import { async_save_event } from '../../../actions/events';
import AttendeesRow from './attendees_row';
import ColorPicker from './color_picker';
import DatesRow from './dates_row';
import DescriptionRow from './description_row';
import LinkRow from './link_row';
import LocationRow from './location_row';


class ReadOnlyEventTooltip extends React.Component {
    constructor() {
        super();
        this.delete_event = this.delete_event.bind(this);
        this.double_click_handler = this.double_click_handler.bind(this);
        this.save_rsvp = this.save_rsvp.bind(this);
        this.select_color = this.select_color.bind(this);
    }

    delete_event() {
        if (!_.isNull(this.props.id)) {
            $('#event-deletion-modal').data('event-id', this.props.id).foundation('open');
        }
    }

    double_click_handler(event) {
        const $header = $(event.target).closest('.title-header');
        if ($header.length > 0) {
            this.props.toggle_edit_mode(event);
        }
    }

    save_rsvp(response_status) {
        const attendees = _.get(this.props.event, 'attendees', []);
        const self = _.find(attendees, { self: true });
        if (_.isUndefined(self)) {
            attendees.unshift({
                response_status
            });
        } else {
            self.response_status = response_status;
        }
        const event_patch = {
            attendees,
        };
        this.props.dispatch(async_save_event(this.props.event.id, event_patch)).catch(fetch_error);
    }

    select_color(color) {
        const color_id = _.findKey(this.props.colors, { background: color });
        const event_patch = { color_id };
        this.props
            .dispatch(async_save_event(this.props.event.id, event_patch))
            .catch(fetch_error);
    }

    _render_header() {
        const title = _.get(this.props.event, 'title', '');
        const empty_title = _.isEmpty(title);
        const layer_color = _.get(this.props.layer, 'color', 'transparent');
        const picker_color = _.get(this.props.event, 'color', layer_color);
        const header_style = {
            borderBottom: `3px solid ${layer_color}`,
        };
        const header_classes = classnames(
            'constrained',
            {
                'empty-title': empty_title
            }
        );
        const formatted_title = empty_title ? 'No Event Title' : title;

        if (!_.isEmpty(this.props.colors)) {
            const default_color = {
                background: picker_color,
            };
            return (
                <header style={header_style} className="title-header">
                    <ColorPicker
                      colors={this.props.colors}
                      default_color={default_color}
                      select_color={this.select_color}
                    />
                    <div className="title-wrapper">
                        <h6 className={header_classes}>
                            {formatted_title}
                        </h6>
                    </div>
                </header>
            );
        }

        return (
            <header style={header_style} className="title-header">
                <h6 className={header_classes}>
                    {formatted_title}
                </h6>
            </header>
        );
    }

    _render_footer() {
        if (_.get(this.props.event, 'kind', '') === 'event#invitation') {
            return (
                <footer className="text-center">
                    <div className="button-group tiny">
                        <button className="secondary button" onClick={_.partial(this.save_rsvp, 'accepted')}>Going</button>
                        <button className="secondary button" onClick={_.partial(this.save_rsvp, 'tentative')}>Maybe</button>
                        <button className="secondary button" onClick={_.partial(this.save_rsvp, 'declined')}>Decline</button>
                    </div>
                </footer>
            );
        }

        const edit_buttons = this._render_edit_buttons();
        if (!_.isNull(edit_buttons)) {
            return (
                <footer>
                    {edit_buttons}
                    <div className="clearfix" />
                </footer>
            );
        }

        return null;
    }

    _render_edit_buttons() {
        const edit_button = (
            _.get(this.props.layer, 'acl.edit', false) ? (
                <button
                  onClick={this.props.toggle_edit_mode}
                  className="secondary button small"
                >
                    Edit
                </button>
            ) : null
        );
        const delete_button = (
            _.get(this.props.layer, 'acl.delete', false) ? (
                <button
                  onClick={this.delete_event}
                  className="alert button small float-right"
                >
                    Delete
                </button>
            ) : null
        );

        if (!_.isNull(edit_button) || !_.isNull(delete_button)) {
            return (
                <div>
                    {edit_button}
                    {delete_button}
                </div>
            );
        }
        return null;
    }

    render() {
        return (
            <div className="read-only-tooltip" onDoubleClick={this.double_click_handler}>
                {this._render_header()}

                <DatesRow
                  start={_.get(this.props.event, 'start')}
                  end={_.get(this.props.event, 'end')}
                  all_day={_.get(this.props.event, 'allDay', false)}
                />
                <LocationRow location={_.get(this.props.event, 'location')} />
                <AttendeesRow attendees={_.get(this.props.event, 'attendees')} />
                <DescriptionRow description={_.get(this.props.event, 'description')} />
                <LinkRow link={_.get(this.props.event, 'link')} id={this.props.id} />

                {this._render_footer()}
            </div>
        );
    }
}

ReadOnlyEventTooltip.propTypes = {
    event: event_prop_type,
    id: React.PropTypes.string,
    toggle_edit_mode: React.PropTypes.func,
    dispatch: React.PropTypes.func,
    layer: layer_prop_type,
    colors: React.PropTypes.objectOf(color_prop_type),
};


const ReadOnlyEventTooltipContainer = connect()(ReadOnlyEventTooltip);
export default ReadOnlyEventTooltipContainer;
