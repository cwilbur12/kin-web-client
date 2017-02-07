/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';
import _ from 'lodash';


export default class DescriptionRow extends React.Component {
    render() {
        if (!_.isEmpty(this.props.description)) {
            return (
                <div className="description-row row">
                    <p className="constrained">
                        {this.props.description}
                    </p>
                </div>
            );
        }
        return null;
    }
}

DescriptionRow.propTypes = {
    description: React.PropTypes.string,
};
