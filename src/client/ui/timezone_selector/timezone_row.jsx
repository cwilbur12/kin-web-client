/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import classnames from 'classnames';
import moment from 'moment-timezone';
import React from 'react';

import { user_config } from '../../utils';


const TimezoneRow = (props) => {
    const classes = classnames({
        active: user_config.timezone === props.timezone,
    }, 'row');
    const current_time = moment.tz(props.timezone);
    return (
        <tr
          className={classes}
          data-value={props.timezone}
          onClick={props.select_timezone}
        >
            <th>
                {current_time.zoneAbbr()}
            </th>
            <td>
                {current_time.format(user_config.time_format)}
            </td>
            <td>
                {props.timezone}
            </td>
        </tr>
    );
};


TimezoneRow.propTypes = {
    timezone: React.PropTypes.string,
    select_timezone: React.PropTypes.func,
};


export default TimezoneRow;
