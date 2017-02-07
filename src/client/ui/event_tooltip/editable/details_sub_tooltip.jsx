/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';


export default class DetailsSubTooltip extends React.Component {
    constructor() {
        super();
        this._on_key_up = this._on_key_up.bind(this);
    }

    // This is a utility function to ease keyboard navigation:
    // If the element is focused and you press enter/space, it will toggle
    // the sub tooltip
    _on_key_up(js_event) {
        if (js_event.which === 13 || js_event.which === 32) {
            this.props.toggle_subtooltip();
        }
    }

    render() {
        return (
            <div className="details-sub-tooltip">
                <header>
                    <h5
                      className="text-center cursored"
                      onClick={this.props.toggle_subtooltip}
                      onKeyUp={this._on_key_up}
                      tabIndex={0}
                    >
                        <div className="float-left">
                            <span className="fa fa-chevron-left" />
                        </div>
                        {this.props.title}
                    </h5>
                </header>
                {this.props.children}
            </div>
        );
    }
}


DetailsSubTooltip.propTypes = {
    children: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.node),
        React.PropTypes.node
    ]),
    toggle_subtooltip: React.PropTypes.func,
    title: React.PropTypes.string,
};
