/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';
import { render } from 'react-dom';

import { template_hide_loader_spinners, template_show_roots } from './utils';
import AuthenticationModal from './ui/authentication_modal';

require('../public/styles/main.scss');


function _first_render_callback() {
    template_hide_loader_spinners();
    template_show_roots();
}


function main() {
    const root_element = document.getElementsByClassName('root')[0];
    render(
        <AuthenticationModal show />,
        root_element,
        _first_render_callback
    );
}


main();
