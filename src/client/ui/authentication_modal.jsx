/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import React from 'react';

import { api_url } from '../utils';


export default function AuthenticationModal(props) {
    const classes = classnames('authentication-modal', { show: props.show });
    return (
        <div className={classes}>
            <div className="logo" />
            <div className="callout">
                <a
                  className="provider-button row google-style"
                  href={api_url('/authentication/google')}
                >
                    <span className="small-2 columns fa fa-google social-icon" />
                    <span className="small-10 columns text-left">Connect with Google</span>
                </a>
                <a
                  className="provider-button row facebook-style"
                  href={api_url('/authentication/facebook')}
                >
                    <span className="small-2 columns fa fa-facebook social-icon" />
                    <span className="small-10 columns text-left">Connect with Facebook</span>
                </a>
            </div>
        </div>
    );
}


AuthenticationModal.propTypes = {
    show: React.PropTypes.bool,
};
