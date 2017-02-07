/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import React from 'react';
import _ from 'lodash';

import { api_url, providers, user_config } from '../../utils';
import { async_deauth_source } from '../../actions/sources';


export default class SettingsModalSourceRow extends React.Component {
    constructor() {
        super();
        this._on_deauth_click = this._on_deauth_click.bind(this);
    }

    _on_deauth_click(event) {
        const source_id = $(event.target).data('source-id');
        this.props.dispatch(async_deauth_source(source_id));
    }

    _get_connect_classes() {
        return classnames('button', 'small', 'primary', {
            hide: !_.isEmpty(this.props.id),
        });
    }

    _get_reconnect_classes() {
        return classnames('button', 'small', 'primary', {
            hide: this.props.status !== 'disconnected',
        });
    }

    _get_disconnect_classes() {
        return classnames('button', 'small', 'alert', {
            hide: _.isEmpty(this.props.id),
        });
    }

    render() {
        return (
            <tr>
                <td>
                    {(() => {
                        if (this.props.status === 'disconnected') {
                            return (
                                <div className="disconnect-overlay">
                                    <span className="fa fa-exclamation-triangle" />
                                </div>
                            );
                        }
                        return null;
                    })()}
                    <img
                      className="provider-logo"
                      alt={this.props.name}
                      src={providers[this.props.name].logo}
                    />
                </td>
                <td>
                    {_.capitalize(this.props.name)}
                    {this.props.sub_title ? <em><br />{this.props.sub_title}</em> : ''}
                </td>
                <td>
                    <a
                      className={this._get_connect_classes()}
                      href={api_url(`/source/${this.props.name}?token=${user_config.token}`)}
                    >
                        Add an account
                    </a>
                    <a
                      className={this._get_reconnect_classes()}
                      href={api_url(`/source/${this.props.name}?token=${user_config.token}`)}
                      onClick={this._on_reauth_click}
                    >
                        Reconnect
                    </a>
                    <a
                      className={this._get_disconnect_classes()}
                      data-source-id={this.props.id}
                      onClick={this._on_deauth_click}
                    >
                        Disconnect
                    </a>
                </td>
            </tr>
        );
    }
}

SettingsModalSourceRow.propTypes = {
    id: React.PropTypes.string,
    status: React.PropTypes.string,
    name: React.PropTypes.string,
    sub_title: React.PropTypes.string,
    dispatch: React.PropTypes.func,
};
