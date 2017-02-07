/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { toggle_color_picker_tooltip } from '../../../actions/ui';
import KinTooltip from '../../kin_tooltip';
import { color_prop_type } from '../../../prop_types';


const KIN_COLOR = {
    background: '#EC4956',
    foreground: '#FFFFFF',
};


function ColorPickerButton(props) {
    const style = {
        background: props.color.background,
    };
    return (
        <button
          className="color-picker-button"
          onClick={props.onClick}
          data-color={props.color.background}
          style={style}
        />
    );
}


ColorPickerButton.propTypes = {
    color: color_prop_type.isRequired,
    onClick: React.PropTypes.func,
};


class ColorPicker extends React.Component {
    constructor() {
        super();
        this._hide_tooltip = this._hide_tooltip.bind(this);
        this._show_tooltip = this._show_tooltip.bind(this);
        this.select_color = this.select_color.bind(this);
    }

    _hide_tooltip() {
        this.props.dispatch(toggle_color_picker_tooltip(false));
    }

    _show_tooltip() {
        this.props.dispatch(toggle_color_picker_tooltip(true));
    }

    select_color(react_js_event) {
        const color = $(react_js_event.target).data('color');
        this.props.select_color(color);
    }

    render() {
        const default_color = (
            _.isUndefined(this.props.default_color)
                ? KIN_COLOR : this.props.default_color
        );
        const target = (this.props.show) ? this._tooltip_target : null;

        return (
            <div className="color-picker" ref={(ref) => { this._tooltip_target = ref; }}>
                <ColorPickerButton color={default_color} onClick={this._show_tooltip} />
                <KinTooltip
                  on_close={this._hide_tooltip}
                  root_classes={['color-picker-tooltip']}
                  target={target}
                >
                    {_.map(this.props.colors, (color, color_index) => {
                        return (
                            <ColorPickerButton
                              color={color}
                              key={color_index}
                              onClick={this.select_color}
                            />
                        );
                    })}
                </KinTooltip>
            </div>
        );
    }
}


ColorPicker.propTypes = {
    colors: React.PropTypes.objectOf(color_prop_type),
    default_color: color_prop_type,
    select_color: React.PropTypes.func.isRequired,

    // Those come from Redux
    dispatch: React.PropTypes.func,
    show: React.PropTypes.bool,
};


function map_state_props(state) {
    return state.ui.color_picker_tooltip;
}


const ColorPickerContainer = connect(map_state_props)(ColorPicker);
export default ColorPickerContainer;
