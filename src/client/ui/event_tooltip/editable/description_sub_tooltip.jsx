/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';

import DetailsSubTooltip from './details_sub_tooltip';


export default class DescriptionSubTooltip extends React.Component {
    constructor() {
        super();

        this._on_description_change = this._on_description_change.bind(this);
    }

    _on_description_change(react_event) {
        this.props.on_change({
            description: react_event.target.value,
        });
    }

    render() {
        return (
            <DetailsSubTooltip
              title="Description"
              toggle_subtooltip={this.props.toggle_subtooltip}
            >
                <div className="description-subtooltip">
                    <textarea
                      defaultValue={this.props.description}
                      placeholder="Enter a description"
                      onChange={this._on_description_change}
                      autoFocus
                    />
                </div>
            </DetailsSubTooltip>
        );
    }
}

DescriptionSubTooltip.propTypes = {
    description: React.PropTypes.string,
    on_change: React.PropTypes.func,
    toggle_subtooltip: React.PropTypes.func,
};
