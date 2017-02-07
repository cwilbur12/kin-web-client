/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import Popper from 'popper.js';
import React from 'react';
import _ from 'lodash';


class KinTooltip extends React.Component {
    constructor() {
        super();
        this._tooltip = null;
    }

    componentDidUpdate() {
        if (!_.isNull(this._tooltip_root) && !_.isNull(this.props.target)) {
            this._refresh_tooltip();
        }
    }

    componentWillUnmount() {
        if (!_.isNull(this._tooltip)) {
            this._tooltip.destroy();
        }
    }

    _refresh_tooltip() {
        if (!_.isNull(this._tooltip)) {
            this._tooltip.destroy();
        }

        this._tooltip = new Popper(
            this.props.target,
            this._tooltip_root,
            this.props.tooltip_options
        );
    }

    get root_classes() {
        return [
            'kin-tooltip',
            {
                show: this.props.target !== null,
            },
            ...this.props.root_classes
        ];
    }

    get overlay_classes() {
        return [
            'kin-tooltip-overlay',
            {
                show: this.props.target !== null,
            },
            ...this.props.overlay_classes
        ];
    }

    render() {
        return (
            <div className="kin-tooltip-wrapper">
                <div
                  className={classnames(this.root_classes)}
                  ref={(ref) => { this._tooltip_root = ref; }}
                >
                    <div className="tooltip-arrow" />
                    {this.props.children}
                </div>
                <div
                  className={classnames(this.overlay_classes)}
                  onClick={this.props.on_close}
                />
            </div>
        );
    }
}


KinTooltip.defaultProps = {
    overlay_classes: [],
    tooltip_options: {
        placement: 'bottom',
        boundariesPadding: 20,
        boundariesElement: 'window',
        arrowElement: '.tooltip-arrow',
    },
    root_classes: [],
};


KinTooltip.propTypes = {
    children: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.node),
        React.PropTypes.node
    ]),
    on_close: React.PropTypes.func,
    overlay_classes: React.PropTypes.arrayOf(React.PropTypes.string),
    tooltip_options: React.PropTypes.objectOf(React.PropTypes.any),
    root_classes: React.PropTypes.arrayOf(React.PropTypes.string),
    target: React.PropTypes.instanceOf(Element),
};


export default KinTooltip;
