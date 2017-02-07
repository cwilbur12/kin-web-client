/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


// const chai_as_promised = require('chai-as-promised');
const fetch_mock = require('fetch-mock');

const utils = require('../../src/client/utils');
const user_actions = require('../../src/client/actions/user');

const expect = chai.expect;
// chai.use(chai_as_promised);

const API_BASE_URL = 'https://placeholder/1.0';
const STATIC_BASE_URL = 'https://placeholder';


describe('User actions', function () {
    describe('#async_load_user', function () {
        beforeEach(function () {
            this.dispatch_spy = sinon.spy();
        });

        it('eventually returns a user\'s config', function () {
            const reply = {
                status: 200,
                body: {
                    id: 'test',
                    display_name: 'Bob Kin',
                    timezone: '',
                    first_day: 0,
                    default_view: 'agendaWeek',
                    default_calendar_id: '',
                },
            };
            fetch_mock.getOnce(`${API_BASE_URL}/user`, reply);

            const user_promise = user_actions.async_load_user()(this.dispatch_spy);
            return expect(user_promise)
                .to.eventually.deep.equal({
                    id: 'test',
                    display_name: 'Bob Kin',
                    timezone: '',
                    first_day: 0,
                    default_view: 'agendaWeek',
                    default_calendar_id: '',
                });
        });

        afterEach(function () {
            fetch_mock.restore();
        });
    });

    describe('#async_patch_user', function () {
        beforeEach(function () {
            utils.rewire$location_reload(this.location_reload_spy = sinon.spy());
            this.dispatch_spy = sinon.spy();
        });

        it('returns an updated user\'s config', function () {
            const reply = {
                status: 200,
                body: {
                    id: 'test',
                    display_name: 'Bob Kin',
                    timezone: 'Europe/Paris',
                    first_day: 0,
                    default_view: 'agendaWeek',
                    default_calendar_id: '',
                },
            };
            fetch_mock.patchOnce(`${API_BASE_URL}/user`, reply);

            const patch_user_promise = user_actions.async_patch_user({
                timezone: 'Europe/Paris',
            }, true)(this.dispatch_spy);
            return expect(patch_user_promise)
                .to.eventually.deep.equal({
                    id: 'test',
                    display_name: 'Bob Kin',
                    timezone: 'Europe/Paris',
                    first_day: 0,
                    default_view: 'agendaWeek',
                    default_calendar_id: '',
                })
                .then(() => {
                    expect(this.location_reload_spy).to.have.been.called;
                });
        });

        afterEach(function () {
            fetch_mock.restore();
            utils.restore();
        });
    });

    describe('#async_logout_user', function () {
        beforeEach(function () {
            utils.rewire$location_reload(this.location_reload_spy = sinon.spy());
            this.dispatch_spy = sinon.spy();
        });

        it('return a fulfilled promise', function () {
            const reply = {
                status: 200,
                body: {
                    redirect: STATIC_BASE_URL,
                },
            };
            fetch_mock.getOnce(`${API_BASE_URL}/authentication/logout`, reply);

            const logout_user_promise = user_actions.async_logout_user()(this.dispatch_spy);
            return expect(logout_user_promise)
                .to.be.fulfilled
                .then(() => {
                    expect(this.location_reload_spy).to.have.been.called;
                });
        });

        afterEach(function () {
            fetch_mock.restore();
            utils.restore();
        });
    });
});
