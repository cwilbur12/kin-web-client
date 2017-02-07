/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import React from 'react';
import _ from 'lodash';

import { api_url, fetch_check, fetch_options, split_merged_id } from '../../../utils';


export default class LocationRow extends React.Component {
    constructor() {
        super();

        this.state = {
            results: [],
        };

        this.autocomplete = this.autocomplete.bind(this);
        this.debounced_autocomplete = _.debounce(this.autocomplete, 200);
        this.clean_autocomplete_results = this.clean_autocomplete_results.bind(this);
        this.select_location = this.select_location.bind(this);
        this._on_change = this._on_change.bind(this);
    }

    _on_change(react_event) {
        this.props.on_change(react_event.target.value);
        this.debounced_autocomplete(react_event);
    }

    _render_results() {
        if (_.isEmpty(this.state.results)) {
            return null;
        }

        return (
            <div className="autocompletor-results">
                <table>
                    <tbody>
                        {_.map(this.state.results, (location) => {
                            return (
                                <tr
                                  key={location}
                                  data-value={location}
                                  onMouseDown={this.select_location}
                                >
                                    <td>{location}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

    get location() {
        return this.event_location_input.value;
    }

    set location(location) {
        this.event_location_input.value = location;
    }

    autocomplete() {
        if (_.isEmpty(this.location)) {
            this.clean_autocomplete_results();
        } else {
            const [source_id, ] = split_merged_id(this.props.layer_id); // eslint-disable-line array-bracket-spacing
            const url = api_url(
                `/sources/${escape(source_id)}/places`,
                {
                    input: this.location,
                }
            );
            fetch(url, fetch_options())
                .then(_.partial(fetch_check, {}))
                .then((json_res) => {
                    this.setState({
                        results: _.map(_.get(json_res, 'places', []), 'description'),
                    });
                });
        }
    }

    clean_autocomplete_results() {
        this.setState({
            results: [],
        });
    }

    select_location(event) {
        const location = $(event.target).closest('tr').data('value');
        if (!_.isUndefined(location)) {
            this.props.on_change(location);
        }
    }

    render() {
        return (
            <section onBlur={this.clean_autocomplete_results}>
                <label
                  className={classnames({ focused: this.props.focused })}
                  htmlFor="event-location-input"
                >
                    Location
                    <input
                      id="event-location-input"
                      type="text"
                      value={this.props.location}
                      placeholder="Type an address or a place name"
                      onBlur={this.props.on_blur}
                      onChange={this._on_change}
                      onFocus={this.props.on_focus}
                      ref={(ref) => { this.event_location_input = ref; }}
                    />
                    {this._render_results()}
                </label>
            </section>
        );
    }
}


LocationRow.propTypes = {
    layer_id: React.PropTypes.string,
    location: React.PropTypes.string,

    on_blur: React.PropTypes.func,
    on_change: React.PropTypes.func,
    on_focus: React.PropTypes.func,
    focused: React.PropTypes.bool,
};
