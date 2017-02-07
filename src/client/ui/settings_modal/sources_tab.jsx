/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';
import _ from 'lodash';

import { source_prop_type } from '../../prop_types';
import { split_source_id, providers } from '../../utils';
import SettingsModalSourceRow from './source_row';


const SettingsModalSourcesTab = (props) => {
    return (
        <div className="tabs-panel" id="settings-accounts">
            <header>
                <h4>Add Account</h4>
            </header>
            <table className="hover available-sources">
                <tbody>
                    {_.map(providers, (provider, name) => {
                        return (
                            <SettingsModalSourceRow
                              key={name}
                              name={name}
                              sub_title={provider.settings_sub_title}
                            />
                        );
                    })}
                </tbody>
            </table>

            <header>
                <h4>Connected Accounts</h4>
            </header>
            <table className="hover connected-sources">
                <tbody>
                    {_.map(props.sources, (source) => {
                        const { provider_name } = split_source_id(source.id);
                        const sub_title = _([source.display_name, source.email])
                                                   .filter(val => !_.isNil(val))
                                                   .join(' - ');
                        return (
                            <SettingsModalSourceRow
                              key={source.id}
                              id={source.id}
                              status={source.status}
                              name={provider_name}
                              sub_title={sub_title}
                              dispatch={props.dispatch}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


SettingsModalSourcesTab.propTypes = {
    sources: React.PropTypes.objectOf(source_prop_type),
    dispatch: React.PropTypes.func,
};


export default SettingsModalSourcesTab;
