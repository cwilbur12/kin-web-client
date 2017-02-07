/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


const chai_as_promised = require('chai-as-promised');
const fetch_mock = require('fetch-mock');

const utils = require('../../src/client/utils');
const sources_actions = require('../../src/client/actions/sources');

const expect = chai.expect;
chai.use(chai_as_promised);

const API_BASE_URL = 'https://placeholder/1.0';


describe('Sources actions', function () {
    describe('#add_sources', function () {
        it('returns an `ADD_SOURCES` action', function () {
            const sources = [
                {
                    id: '1234',
                },
            ];
            expect(sources_actions.add_sources(sources))
                .to.be.deep.equal({
                    type: 'ADD_SOURCES',
                    sources: [
                        {
                            id: '1234',
                        },
                    ],
                });
        });
    });

    describe('#patch_source', function () {
        it('returns a `PATCH_SOURCE` action', function () {
            const source_id = '1234';
            const source_patch = {
                status: 'disconnected',
            };
            expect(sources_actions.patch_source(source_id, source_patch))
                .to.be.deep.equal({
                    type: 'PATCH_SOURCE',
                    id: '1234',
                    patch: {
                        status: 'disconnected',
                    },
                });
        });
    });

    describe('#delete_sources', function () {
        it('returns a `DELETE_SOURCES` action', function () {
            const ids = ['1234', '5678'];
            expect(sources_actions.delete_sources(ids))
                .to.be.deep.equal({
                    type: 'DELETE_SOURCES',
                    ids: ['1234', '5678'],
                });
        });
    });

    describe('#async_load_sources', function () {
        // TODO: Test with sources currently refreshing
        // TODO: handle what could be caused by `fetch_check`?
        beforeEach(function () {
            this.dispatch_spy = sinon.spy();
        });

        it('eventually dispatches `add_sources`', function () {
            const reply = {
                sources: [
                    {
                        id: '1234',
                        status: 'disconnected',
                    },
                    {
                        id: '5678',
                        status: 'connected',
                    },
                ],
            };
            fetch_mock.getOnce(`${API_BASE_URL}/sources`, reply);

            const sources_promise = sources_actions.async_load_sources()(this.dispatch_spy);
            return expect(sources_promise)
                .to.be.fulfilled
                .then(() => {
                    expect(this.dispatch_spy).to.have.been.calledWith({
                        type: 'ADD_SOURCES',
                        sources: [
                            {
                                id: '1234',
                                status: 'disconnected',
                                loaded: false,
                            },
                            {
                                id: '5678',
                                status: 'connected',
                                loaded: false,
                            },
                        ],
                    });
                });
        });

        afterEach(function () {
            fetch_mock.restore();
        });
    });

    describe('#async_deauth_source', function () {
        // TODO: Add a way to not reload / relocate?
        // TODO: what happens if `source_id` is shit?
        beforeEach(function () {
            utils.rewire$location_redirect(this.location_redirect_spy = sinon.spy());
            this.dispatch_spy = sinon.spy();
        });

        it('returns a fulfilled promise', function () {
            const provider_name = 'google';
            const source_id = `${provider_name}-1234`;
            const reply = {
                redirect: 'http://zombo.com/',
            };
            fetch_mock.getOnce(`${API_BASE_URL}/source/${provider_name}/deauth/${source_id}`, reply);

            const deauth_promise = sources_actions.async_deauth_source(
                source_id)(this.dispatch_spy);
            return expect(deauth_promise)
                .to.be.fulfilled
                .then(() => {
                    expect(this.location_redirect_spy).to.have.been.calledWith(
                        'http://zombo.com/');
                });
        });

        afterEach(function () {
            fetch_mock.restore();
            utils.restore();
        });
    });
});
