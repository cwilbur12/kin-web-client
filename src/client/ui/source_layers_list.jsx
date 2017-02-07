/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import { connect } from 'react-redux';
import React from 'react';
import _ from 'lodash';

import { layer_prop_type } from '../prop_types';
import { split_source_id, user_config } from '../utils';
import SourceLayersListItem from './source_layers_list_item';


class SourceLayersList extends React.Component {
    constructor() {
        super();
        this.accessory_click = this.accessory_click.bind(this);
    }

    _render_accessory() {
        const disconnected_indicator_classes = classnames(
            'fa', 'fa-exclamation-triangle',
            { hide: this.props.status !== 'disconnected' }
        );
        const loading_spinner_classes = classnames(
            'loading',
            { hide: this.props.loaded || this.props.status === 'disconnected' }
        );
        const collapser_classes = classnames(
            'fa',
            {
                'fa-chevron-down': user_config.is_collapsed(this.props.id),
                'fa-chevron-up': !user_config.is_collapsed(this.props.id),
            },
            { hide: !this.props.loaded || this.props.status === 'disconnected' }
        );
        return (
            <div className="float-right source-accessory">
                <div className={loading_spinner_classes} />
                <div className={collapser_classes} />
                <div className={disconnected_indicator_classes} />
            </div>
        );
    }

    accessory_click() {
        if (this.props.status === 'disconnected') {
            $('#settings-modal').foundation('open');
            $('#settings-tabs').foundation('selectTab', 'settings-accounts');
        } else {
            const collapsed = user_config.is_collapsed(this.props.id);
            user_config.set_collapsed(this.props.id, !collapsed);
            this.forceUpdate();
        }
    }

    render() {
        const { provider_name } = split_source_id(this.props.id);
        return (
            <div className="source-layers-list" id={this.props.id}>
                <h3 onClick={this.accessory_click}>
                    {this._render_accessory()}
                    <div className="source-title">
                        {_.capitalize(provider_name)}
                        &nbsp;
                        <strong>
                            {(
                                !_.isEmpty(this.props.email)
                                    ? this.props.email
                                    : this.props.display_name
                             )}
                        </strong>
                    </div>
                </h3>
                <div className="clearfix" />
                <ul
                  className={classnames(
                             'menu', 'vertical', {
                                 hide: user_config.is_collapsed(this.props.id),
                             })}
                >
                    {this.props.status !== 'disconnected' && _.map(this.props.layers, (layer) => {
                        return (
                            <SourceLayersListItem
                              dispatch={this.props.dispatch}
                              key={layer.id}
                              {...layer}
                            />
                        );
                    })}
                </ul>
            </div>
        );
    }
}


SourceLayersList.propTypes = {
    loaded: React.PropTypes.bool,
    id: React.PropTypes.string,
    dispatch: React.PropTypes.func,
    status: React.PropTypes.string,
    email: React.PropTypes.string,
    display_name: React.PropTypes.string,
    layers: React.PropTypes.objectOf(layer_prop_type),
};

const map_state_props = (state, own_props) => {
    return {
        layers: _(state.layers)
                         .at(own_props.layers)
                         .keyBy('id')
                         .value(),
    };
};


const SourceLayersListContainer = connect(map_state_props)(SourceLayersList);
export default SourceLayersListContainer;
