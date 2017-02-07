/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import React from 'react';

import { fetch_error } from '../utils';
import { async_toggle_selected_layer } from '../actions/layers';
import { async_load_events } from '../actions/events';


export default class SourceLayersListItem extends React.Component {
    constructor(props) {
        super(props);
        this.toggle_events = this.toggle_events.bind(this);
    }

    toggle_events() {
        if (this.props.loaded !== this.props.selected) {
            return;
        }

        const layer_id = this.props.id;
        if (this.props.selected) {
            this.props
                .dispatch(async_toggle_selected_layer(layer_id, false))
                .catch(fetch_error);
        } else {
            this.props
                .dispatch(async_toggle_selected_layer(layer_id, true))
                .catch(fetch_error);
            this.props.dispatch(async_load_events(layer_id)).catch(fetch_error);
        }
    }

    render() {
        const layer_style = (() => {
            if (this.props.selected) {
                return {
                    borderLeft: `10px solid ${this.props.color}`,
                    opacity: '1.0',
                };
            }
            return {
                borderLeft: '10px solid transparent',
                opacity: '0.5',
            };
        })();

        const loading_spinner_classes = classnames(
            'loading',
            { hide: this.props.loaded === this.props.selected }
        );

        const checkbox_classes = classnames(
            { hide: this.props.loaded !== this.props.selected }
        );

        return (
            <li style={layer_style}>
                <div className="float-right source-layer-checkbox">
                    <div className={loading_spinner_classes} />
                    <input
                      id={this.props.id}
                      type="checkbox"
                      checked={this.props.selected}
                      onChange={this.toggle_events}
                      className={checkbox_classes}
                    />
                </div>
                <label htmlFor={this.props.id}>
                    {this.props.title}
                </label>
            </li>
        );
    }
}

SourceLayersListItem.propTypes = {
    loaded: React.PropTypes.bool,
    selected: React.PropTypes.bool,
    id: React.PropTypes.string,
    dispatch: React.PropTypes.func,
    color: React.PropTypes.string,
    title: React.PropTypes.string,
};
