/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { source_prop_type } from '../prop_types';
import SourceLayersList from './source_layers_list';


class SourcesList extends React.Component {
    constructor() {
        super();
        this.add_more_accounts = this.add_more_accounts.bind(this);
    }

    add_more_accounts() {
        $('#settings-modal').foundation('open');
        $('#settings-tabs').foundation('selectTab', 'settings-accounts');
    }

    render() {
        return (
            <div id="sources-list">
                {_(this.props.sources).sortBy('id').map((source) => {
                    return (
                        <SourceLayersList key={source.id} {...source} />
                    );
                }).value()}
                <div className="add-account text-center">
                    <button
                      className="button secondary small"
                      onClick={this.add_more_accounts}
                    >
                         Add an account
                    </button>
                </div>
            </div>
        );
    }
}


SourcesList.propTypes = {
    sources: React.PropTypes.objectOf(source_prop_type),
};


const map_state_props = (state) => {
    return {
        sources: state.sources,
    };
};


const SourcesListContainer = connect(map_state_props)(SourcesList);
export default SourcesListContainer;
