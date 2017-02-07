/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import React from 'react';
import _ from 'lodash';

import { split_merged_id, split_source_id } from '../../../utils';


export default class LinkRow extends React.Component {
    render() {
        if (!_.isEmpty(this.props.link)) {
            const [source_id, , ] = split_merged_id(this.props.id); // eslint-disable-line array-bracket-spacing
            const { provider_name } = split_source_id(source_id);

            const classes = classnames(
                'provider-button',
                'tiny',
                `${provider_name}-style`,
                'float-left'
            );
            return (
                <div className="row">
                    <div className="small-12 columns">
                        <a
                          href={this.props.link}
                          className={classes}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                            see on {provider_name}
                        </a>
                    </div>
                </div>
            );
        }
        return null;
    }
}

LinkRow.propTypes = {
    id: React.PropTypes.string,
    link: React.PropTypes.string,
};
