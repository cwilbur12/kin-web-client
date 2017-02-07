/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import React from 'react';
import _ from 'lodash';

import { expanded_source_prop_type } from '../../../prop_types';
import { split_merged_id, split_source_id } from '../../../utils';


export default class LayerRow extends React.Component {
    get layer_id() {
        return _.get(this.event_layer_input, 'value', this.props.layer_id);
    }

    render() {
        if (!this.props.creating) {
            return null;
        }
        const [source_id, ] = split_merged_id(this.props.layer_id); // eslint-disable-line array-bracket-spacing
        const selected_layer = _.get(this.props, ['create_able_sources', source_id, 'layers', this.props.layer_id], null);
        const layer_row_style = {
            borderLeft: `10px solid ${selected_layer.color}`,
        };
        return (
            <section className="layer-row" style={layer_row_style}>
                <label
                  className={classnames({ focused: this.props.focused })}
                  htmlFor="event-layer-select"
                >
                    Calendar
                    <select
                      id="event-layer-select"
                      ref={(ref) => { this.event_layer_input = ref; }}
                      value={selected_layer.id}
                      onBlur={this.props.on_blur}
                      onChange={this.props.on_change}
                      onFocus={this.props.on_focus}
                      autoFocus={this.props.focused}
                    >
                        {_.map(this.props.create_able_sources, (source) => {
                            const { provider_name } = split_source_id(source.id);
                            const source_display_name = _([
                                _.capitalize(provider_name),
                                source.email,
                            ]).filter(val => !_.isNil(val)).join(' - ');
                            return (
                                <optgroup label={source_display_name} key={source.id}>
                                    {_.map(source.layers, (layer) => {
                                        return (
                                            <option
                                              key={layer.id}
                                              value={layer.id}
                                            >
                                                {layer.title}
                                            </option>
                                        );
                                    })}
                                </optgroup>
                            );
                        })}
                    </select>
                </label>
            </section>
        );
    }
}


LayerRow.propTypes = {
    layer_id: React.PropTypes.string,
    create_able_sources: React.PropTypes.objectOf(expanded_source_prop_type),
    creating: React.PropTypes.bool,
    focused: React.PropTypes.bool.isRequired,
    on_blur: React.PropTypes.func,
    on_change: React.PropTypes.func.isRequired,
    on_focus: React.PropTypes.func,
};
