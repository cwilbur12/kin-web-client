/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


const chai_as_promised = require('chai-as-promised');
// const fetch_mock = require('fetch-mock');

const events_actions = require('../../src/client/actions/events');

const expect = chai.expect;
chai.use(chai_as_promised);


describe('Events actions', function () {
    describe('#add_events', function () {
        it('returns an `ADD_EVENTS` action', function () {
            const events = [
                {
                    id: 'kin-1234:abcd:alpha',
                },
            ];
            expect(events_actions.add_events(events))
                .to.deep.equal({
                    type: 'ADD_EVENTS',
                    creating: false,
                    events: [
                        {
                            id: 'kin-1234:abcd:alpha',
                        },
                    ],
                });
        });
    });

    describe('#delete_events', function () {
        it('returns a `DELETE_EVENTS` action', function () {
            const event_id = 'kin-1234:abcd:alpha';
            expect(events_actions.delete_events([event_id]))
                .to.deep.equal({
                    type: 'DELETE_EVENTS',
                    ids: ['kin-1234:abcd:alpha'],
                });
        });
    });

    describe('#deselect_event', function () {
        beforeEach(function () {
            this.dispatch_spy = sinon.spy();
            this.get_state_stub = sinon.stub();
            this.foundation_spy = sinon.spy();
            $.fn.foundation = this.foundation_spy;
        });

        it('dispatches a `DESELECT_EVENT` when an event was selected', function () {
            this.get_state_stub.returns({
                selected_event: {
                    id: 'kin-1234:abcd:alpha',
                    dirty: false,
                },
                ui: {
                    color_picker_tooltip: {
                        show: false,
                    },
                },
            });
            events_actions.deselect_event()(this.dispatch_spy, this.get_state_stub);
            expect(this.dispatch_spy)
                .to.have.been.calledWith({
                    type: 'DESELECT_EVENT',
                });
            expect(this.dispatch_spy)
                .to.have.been.calledOnce;
        });


        it('dispatches a `TOGGLE_COLOR_PICKER_TOOLTIP` when an event was selected and the color picker was shown', function () {
            this.get_state_stub.returns({
                selected_event: {
                    id: 'kin-1234:abcd:alpha',
                    dirty: false,
                },
                ui: {
                    color_picker_tooltip: {
                        show: true,
                    },
                },
            });
            events_actions.deselect_event()(this.dispatch_spy, this.get_state_stub);
            expect(this.dispatch_spy)
                .to.have.been.calledWith({
                    type: 'DESELECT_EVENT',
                });
            expect(this.dispatch_spy)
                .to.have.been.calledWith({
                    type: 'TOGGLE_COLOR_PICKER_TOOLTIP',
                    toggle: false,
                });
        });

        it('shows the leave edit mode modal if the selected event is dirty', function () {
            this.get_state_stub.returns({
                selected_event: {
                    id: 'kin-1234:abcd:alpha',
                    dirty: true,
                },
            });
            events_actions.deselect_event()(this.dispatch_spy, this.get_state_stub);
            expect(this.foundation_spy)
                .to.have.been.calledWith('open');
        });

        it('does nothing when no event was selected', function () {
            this.get_state_stub.returns({
                selected_event: {
                    id: null,
                },
            });
            events_actions.deselect_event()(this.dispatch_spy, this.get_state_stub);
            expect(this.dispatch_spy)
                .to.not.have.been.called;
        });

        afterEach(function () {
            delete $.fn.foundation;
        });
    });

    describe('#select_event', function () {
        beforeEach(function () {
            this.get_state_stub = sinon.stub();
            this.dispatch_spy = sinon.spy(
                (action) => {
                    // Freely inspired by redux-thunk
                    if (typeof action === 'function') {
                        return action(this.dispatch_spy, this.get_state_stub);
                    }
                    return action;
                } // eslint-disable-line comma-dangle
            );
        });

        it('dispatches a `SELECT_EVENT` if no event was selected', function () {
            const event_id = 'kin-1234:abcd:alpha';
            $('<div/>').attr('id', event_id).appendTo($('body'));
            this.get_state_stub.returns({
                selected_event: {
                    id: null,
                },
                events: {
                    [event_id]: {
                        color: '#FFFFFF',
                    },
                },
            });
            events_actions.select_event(event_id)(this.dispatch_spy, this.get_state_stub);
            expect(this.dispatch_spy)
                .to.have.been.calledWith({
                    type: 'SELECT_EVENT',
                    force: false,
                    id: 'kin-1234:abcd:alpha',
                    creating: false,
                });
        });

        it('dispatches a `SELECT_EVENT` after a `DESELECT_EVENT` if an event was previously selected');

        it('does nothing if selecting an already selected event', function () {
            const event_id = 'kin-1234:abcd:alpha';
            this.get_state_stub.returns({
                selected_event: {
                    id: event_id,
                },
            });
            events_actions.select_event(event_id)(this.dispatch_spy, this.get_state_stub);
            expect(this.dispatch_spy)
                .to.not.have.been.called;
        });

        it('dispatches a `SELECT_EVENT` even if selecting an already selected event when setting `force`');
    });

    describe('#create_event', function () {
        it('dispatches an `ADD_EVENTS` and selects it `SELECT_EVENT`');
    });

    describe('#toggle_edit_selected_event', function () {
        it('returns a `TOGGLE_EDIT_SELECTED_EVENT` action', function () {
            expect(events_actions.toggle_edit_selected_event())
                .to.be.deep.equal({
                    type: 'TOGGLE_EDIT_SELECTED_EVENT',
                });
        });
    });

    describe('#set_dirty_selected_event', function () {
        it('returns a `SET_DIRTY_SELECTED_EVENT` action (dirty)', function () {
            expect(events_actions.set_dirty_selected_event(true))
                .to.be.deep.equal({
                    type: 'SET_DIRTY_SELECTED_EVENT',
                    dirty: true,
                });
        });

        it('returns a `SET_DIRTY_SELECTED_EVENT` action (not dirty)', function () {
            expect(events_actions.set_dirty_selected_event(false))
                .to.be.deep.equal({
                    type: 'SET_DIRTY_SELECTED_EVENT',
                    dirty: false,
                });
        });
    });

    describe('#async_load_events', function () {
        // TODO: test both incremental and full syncs?
        it('eventually dispatches an `ADD_EVENTS` and a `PATCH_LAYER`');
    });

    describe('#async_create_event', function () {
        // TODO: test notify attendees?
        it('eventually dispatches a `DELETE_EVENT` and a `DESELECT_EVENT` on placeholder event and an `ADD_EVENTS`');
    });

    describe('#async_save_event', function () {
        it('eventually dispatches a `DESELECT_EVENT` and a `ADD_EVENTS`');
    });

    describe('#async_delete_event', function () {
        it('eventually dispatches a `DESELECT_EVENT` and a `DELETE_EVENT`');
    });
});
