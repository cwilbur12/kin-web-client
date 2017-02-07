/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import Fuse from 'fuse.js';
import React from 'react';
import _ from 'lodash';

import TimezoneRow from './timezone_row';


export default class TimezoneAutoCompletor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filter: '',
        };
        this.filter_timezones = this.filter_timezones.bind(this);

        this._fuse = new Fuse(props.timezones, {
            caseSensitive: false,
            includeScore: false,
            shouldSort: true,
            tokenize: false,
            threshold: 0.6,
        });
    }

    _render_results() {
        const results = _.slice(this._fuse.search(this.state.filter), 0, 20);

        if (_.isEmpty(results)) {
            return null;
        }

        return (
            <div className="autocompletor-results">
                <table>
                    <tbody>
                        {_.map(results, (index) => {
                            const timezone = this.props.timezones[index];
                            return (
                                <TimezoneRow
                                  key={timezone}
                                  timezone={timezone}
                                  select_timezone={this.props.select_timezone}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

    filter_timezones() {
        const searched = $(this.filter_input).val();
        this.setState({
            filter: searched,
        });
    }

    render() {
        return (
            <div className="timezone-autocompletor">
                <input
                  ref={(ref) => { this.filter_input = ref; }}
                  type="text"
                  onChange={this.filter_timezones}
                  placeholder="Find more timezones"
                />
                {this._render_results()}
            </div>
        );
    }
}

TimezoneAutoCompletor.propTypes = {
    timezones: React.PropTypes.arrayOf(React.PropTypes.string),
    select_timezone: React.PropTypes.func,
};
