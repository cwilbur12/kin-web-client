/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import Push from 'push.js';
import querystring from 'querystring';
import _ from 'lodash';

import { API_HOSTNAME } from './config';
import { delete_sources, patch_source } from './actions/sources';


export function location_redirect(url) {
    window.location = url;
}


export function location_reload() {
    window.location.reload();
}


export const user_config = {
    _defaults: {
        token: null,

        default_view: 'agendaWeek',
        display_name: 'No One',
        first_day: 0,
        timezone: 'Europe/Paris',
        date_format: 'ddd M/D',
        time_format: 'HH:mm',
        default_calendar_id: '',

        notification_enabled: false,
        collapsed: {
            'kin:menu': false,
        },
    },

    get authenticated() {
        return this.token !== null;
    },

    get token() {
        return this._get('token');
    },

    set token(token) {
        this._set('token', token);
    },

    get default_view() {
        return this._get('default_view');
    },

    get display_name() {
        return this._get('display_name');
    },

    get first_day() {
        return this._get('first_day');
    },

    get date_format() {
        return this._get('date_format');
    },

    set date_format(date_format) {
        this._set('date_format', date_format);
    },

    get time_format() {
        return this._get('time_format');
    },

    set time_format(time_format) {
        this._set('time_format', time_format);
    },

    get timezone() {
        return this._get('timezone');
    },

    set timezone(timezone) {
        this._set('timezone', timezone);
    },

    get default_calendar_id() {
        return this._get('default_calendar_id');
    },

    set default_calendar_id(default_calendar_id) {
        this._set('default_calendar_id', default_calendar_id);
    },

    get notification_permission() {
        // Push.isSupported = false;
        let permission = 'unsupported';
        try {
            permission = Push.Permission.get();
        } catch (err) {
            console.error(err);
            return 'unsupported';
        }
        if (permission === 'granted') {
            return (this._get('notification_enabled') ? 'granted' : 'default');
        }
        return permission;
    },

    enable_notification(callback) {
        this._set('notification_enabled', true);
        Push.Permission.request(callback);
    },

    disable_notification() {
        this._set('notification_enabled', false);
    },

    load_config(config) {
        this._set('default_calendar_id', config.default_calendar_id);
        this._set('default_view', config.default_view);
        this._set('display_name', config.display_name);
        this._set('first_day', config.first_day);
        this._set('timezone', config.timezone);
        // TODO: we should probably return something else than the parameters?,
        // maybe make it chainable?
        return config;
    },

    is_collapsed(source_id) {
        return _.get(this._get('collapsed'), source_id, false);
    },

    set_collapsed(source_id, collapsed) {
        const all_collapsed = this._get('collapsed');
        all_collapsed[source_id] = collapsed;
        this._set('collapsed', all_collapsed);
    },

    _get(key) {
        return this[`_${key}`] ||
            JSON.parse(localStorage.getItem(`kin:user_config:${key}`)) ||
            this._defaults[key];
    },
    _set(key, value) {
        this[`_${key}`] = value;
        localStorage.setItem(`kin:user_config:${key}`, JSON.stringify(value));
    },
};


export function add_script_tag(src, onload) {
    const script_tag = document.createElement('script');
    script_tag.onload = onload;
    script_tag.setAttribute('src', src);
    document.body.appendChild(script_tag);
}


export function read_query_string(query_string) {
    return _(query_string)
        .split('&')
        .map(
            item => _.split(item, '=')
        )
        .fromPairs()
        .value();
}


export function color_luminance(hex, lum) {
    /* eslint-disable no-param-reassign */
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    let rgb = '#';
    for (let i = 0; i < 3; i += 1) {
        let c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += (`00${c}`).substr(c.length);
    }

    return rgb;
    /* eslint-enable no-param-reassign */
}


export function rgb_to_hsl(hex) {
    /* eslint-disable no-mixed-operators */
    const r = parseInt(hex.substr(0, 2), 16) / 255.0;
    const g = parseInt(hex.substr(2, 2), 16) / 255.0;
    const b = parseInt(hex.substr(4, 2), 16) / 255.0;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    let s;
    const l = (max + min) / 2;

    if (max === min) {
        // achromatic
        s = 0;
        h = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) { // eslint-disable-line default-case
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
    /* eslint-enable no-mixed-operators */
}


export function shift_lum(hex, lum) {
    const hsl = rgb_to_hsl(hex.substr(1));
    return `hsl(${hsl[0] * 360}, ${hsl[1] * 100}%, ${lum}%)`;
}


export function api_url(uri, qs = {}, version = '1.0') {
    const stringified_qs = (_.isEmpty(qs) ? '' : `?${querystring.stringify(qs)}`);
    return `https://${API_HOSTNAME}/${version}${uri}${stringified_qs}`;
}

export function setup_message_popup() {
    $(document).on(
        'click', '.message-close',
        function close_popup() {
            $(this).closest('.message-popup').remove();
        }
    );
}

export function create_message_popup(message, classes = [], delay = 2000) {
    // This is voluntarily not using Redux or any complex stuff to decouple it
    // as much as possible from the rest of the app.
    if (_.isEmpty(message)) {
        return;
    }

    const $message_template = $('.message-popup.template');
    const $message = $message_template.clone().removeClass('template');
    $message.find('.message-text').html(message);
    $message
        .addClass(classes.join(' '))
        .insertAfter($message_template);

    if (delay !== -1) {
        setTimeout(() => {
            $message.remove();
        }, delay);
    }
}

export function fetch_options(overrides = {}, include_token = true) {
    const options = _.merge({
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        mode: 'cors',
    }, overrides);
    if (include_token) {
        options.headers['X-token'] = user_config.token;
    }
    return options;
}


export function fetch_check(dispatch, response) {
    if (response.ok) {
        return response.json();
    }

    const error = new Error(response.statusText || response.status);
    error.response = response;

    switch (response.status) {
    case 401:
        if (user_config.authenticated) {
            // Reload if there is a change of state
            user_config.token = null;
        }
        location_redirect('./auth.html');
        throw error;
    case 400:
    case 404:
        return response
            .json()
            .then((res) => {
                const code = _.get(res, 'code', 0);
                const source_id = _.get(res, ['params', 'source_id']);
                switch (code) { // eslint-disable-line default-case
                case 20: // Source disconnected
                    dispatch(patch_source(source_id, {
                        status: 'disconnected',
                    }));
                    break;

                case 40: // Source not found
                    dispatch(delete_sources([source_id]));
                    break;
                }
                throw error;
            });
    default:
        throw error;
    }
}


export function fetch_error(error) {
    if (!_.isUndefined(error.response)) {
        console.error(error, error.response);
        if (error.response.status !== 401) {
            create_message_popup('an error occured, please retry later', ['error']);
        }
    } else {
        // network error
        create_message_popup('an error occured, please retry later', ['error']);
        console.error(error);
    }
}


export function merge_ids(...args) {
    return args.join(':');
}


export function split_merged_id(merged_id) {
    return merged_id.split(':');
}


export function get_source_id(provider_name, provider_user_id) {
    return [provider_name, provider_user_id].join('-');
}


export function split_source_id(source_id) {
    const splitted = source_id.split('-');
    return {
        provider_name: splitted[0],
        provider_user_id: splitted[1],
    };
}


export function is_create_able_layer(layer) {
    return _.get(layer, 'acl.create', false) && layer.selected && layer.loaded;
}


export function get_create_able_sources(state) {
    return _(state.sources)
        .mapValues((source) => {
            return _.assign({}, source, {
                layers: _(state.layers)
                    .at(source.layers)
                    .filter(is_create_able_layer)
                    .keyBy('id')
                    .value(),
            });
        })
        .filter(source => !_.isEmpty(source.layers))
        .keyBy('id')
        .value();
}


/* eslint-disable global-require */
export const providers = {
    eventbrite: {
        logo: require('../public/imgs/providers/eventbrite@3x.png'),
        settings_sub_title: 'Events you\'re attending',
    },
    facebook: {
        logo: require('../public/imgs/providers/facebook@3x.png'),
        settings_sub_title: 'All your events',
    },
    github: {
        logo: require('../public/imgs/providers/github@3x.png'),
        settings_sub_title: 'Milestones',
    },
    google: {
        logo: require('../public/imgs/providers/google@3x.png'),
        settings_sub_title: 'Your calendars',
    },
    meetup: {
        logo: require('../public/imgs/providers/meetup@3x.png'),
        settings_sub_title: 'Events you\'re attending',
    },
    outlook: {
        logo: require('../public/imgs/providers/outlook@3x.png'),
        settings_sub_title: 'Your calendars',
    },
    todoist: {
        logo: require('../public/imgs/providers/todoist@3x.png'),
        settings_sub_title: 'Your tasks',
    },
    trello: {
        logo: require('../public/imgs/providers/trello@3x.png'),
        settings_sub_title: 'Cards with a due date',
    },
    wunderlist: {
        logo: require('../public/imgs/providers/wunderlist@3x.png'),
        settings_sub_title: 'Tasks with a due date',
    },
};


export const rsvp_icons = {
    accepted: require('../public/imgs/icons/rsvp_accepted.png'),
    tentative: require('../public/imgs/icons/rsvp_tentative.png'),
    needs_action: require('../public/imgs/icons/rsvp_tentative.png'),
    declined: require('../public/imgs/icons/rsvp_declined.png'),
};
/* eslint-enable global-require */


export function hash_code(str) {
    let hash = 0;
    const len = str.length;
    if (len === 0) {
        return hash;
    }
    for (let i = 0; i < len; i += 1) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash &= hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}


export const ATTENDEE_BG_COLORS = [
    '#C39953', '#A17A74', '#6D9BC3', '#CD607E',
    '#AD6F69', '#2E2D88', '#AB92B3', '#676767',
    '#6EAEA1', '#AE98AA', '#BBB477', '#AD4379',
    '#B768A2', '#8BA8B7', '#5DA493', '#A6A6A6',
    '#9E5E6F', '#DA2C43', '#778BA5', '#5FA778',
    '#5F8A8B', '#914E75', '#8A496B', '#56887D',
];


export function template_hide_loader_spinners() {
    const loader_elements = document.getElementsByClassName('loader');
    for (let i = 0; i < loader_elements.length; i += 1) {
        loader_elements[i].style.display = 'none';
    }
}

export function template_show_roots() {
    const root_elements = document.getElementsByClassName('root');
    for (let i = 0; i < root_elements.length; i += 1) {
        root_elements[i].style.display = 'block';
    }
}
