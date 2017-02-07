/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import querystring from 'querystring';
import React from 'react';
import _ from 'lodash';

import { GMAP_PUBLIC_TOKEN } from '../../../config';


const location_icon = require('../../../../public/imgs/icons/location.png');


export default class LocationRow extends React.Component {
    _render_link(location) {
        return (
            <div className="row">
                <a ref={location} target="_blank" rel="noopener noreferrer">
                    <div className="small-2 columns">
                        <img
                          className="location-icon"
                          src={location_icon}
                          alt="Location marker icon"
                        />
                    </div>
                    <div className="small-10 columns">
                        <p className="constrained">{location}</p>
                    </div>
                </a>
            </div>
        );
    }

    _render_map(location) {
        const img_size = {
            width: 350,
            height: 100,
        };

        const stringified_map_img_qs = querystring.stringify({
            size: `${img_size.width}x${img_size.height}`,
            markers: `size:mid|${location}`,
            key: GMAP_PUBLIC_TOKEN,
        });
        const map_img_src = `https://maps.googleapis.com/maps/api/staticmap?${stringified_map_img_qs}`;

        const stringified_map_link_qs = querystring.stringify({
            q: location,
        });
        const map_link = `http://maps.google.com/?${stringified_map_link_qs}`;
        return (
            <div className="location-row row">
                <a href={map_link} target="_blank" rel="noopener noreferrer">
                    <img
                      className="location-map"
                      src={map_img_src}
                      alt={`Map around '${location}'`}
                      style={{ width: img_size.width, height: img_size.height }}
                    />
                    <div className="location-icon-wrapper">
                        <img
                          className="location-icon"
                          src={location_icon}
                          alt="Location marker icon"
                        />
                    </div>
                    <div className="location-text-wrapper">
                        <p className="constrained">{location}</p>
                    </div>
                </a>
            </div>
        );
    }

    render() {
        const location = _.trim(this.props.location);
        if (!_.isEmpty(location)) {
            if (location.startsWith('http')) {
                return this._render_link(location);
            }
            return this._render_map(location);
        }
        return null;
    }
}

LocationRow.propTypes = {
    location: React.PropTypes.string,
};
