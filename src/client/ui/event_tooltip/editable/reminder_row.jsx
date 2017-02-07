/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


import React from 'react';

import SubtooltipOpenerRow from './sub_tooltip_opener_row';
import { reminder_prop_type } from '../../../prop_types';


export default function ReminderRow(props) {
    const nb_reminders = props.reminders.length;
    return (
        <SubtooltipOpenerRow open={props.open}>
            <h6>Reminders</h6>
            <p className="constrained">
                {(
                    nb_reminders === 0
                        ? 'Add alerts'
                        : `${nb_reminders} alert${nb_reminders > 1 ? 's' : ''}`
                )}
            </p>
        </SubtooltipOpenerRow>
    );
}

ReminderRow.propTypes = {
    open: React.PropTypes.func,
    reminders: React.PropTypes.arrayOf(reminder_prop_type),
};
