/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */

export const ROLLBAR_PUBLIC_TOKEN = '';
export const ROLLBAR_CODE_VERSION = 0.1;

export const GMAP_PUBLIC_TOKEN = '';

export const EVENTS_NS = 'kin';

export const API_HOSTNAME = {
    dev: '',
    test: 'placeholder',
    prod: '',
}[KIN_ENV_NAME];

export const rollbar_config = {
    accessToken: ROLLBAR_PUBLIC_TOKEN,
    captureUncaught: true,
    payload: {
        environment: KIN_ENV_NAME,
        client: {
            javascript: {
                source_map_enabled: true,
                code_version: '0.2',
                guess_uncaught_frames: true,
            },
        },
    },
    enabled: (KIN_ENV_NAME === 'prod'),
};
