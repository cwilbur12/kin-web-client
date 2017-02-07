/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


const chai_as_promised = require('chai-as-promised');
const fetch_mock = require('fetch-mock');

const layers_actions = require('../../src/client/actions/layers');

const expect = chai.expect;
chai.use(chai_as_promised);

const API_BASE_URL = 'https://placeholder/1.0';


describe('Layers actions', function () {
    beforeEach(function () {
        this.layer_id = 'kin-1234:abcd';
        this.dispatch_spy = sinon.spy();
    });

    describe('#add_layers', function () {
        it('returns an `ADD_LAYERS` action', function () {
            const layers = [
                {
                    id: 'kin-1234:abcd',
                },
            ];
            expect(layers_actions.add_layers(layers))
                .to.be.deep.equal({
                    type: 'ADD_LAYERS',
                    layers: [
                        {
                            id: 'kin-1234:abcd',
                        },
                    ],
                });
        });
    });

    describe('#patch_layer', function () {
        it('returns a `PATCH_LAYER` action', function () {
            const layer_patch = {
                loaded: true,
            };
            expect(layers_actions.patch_layer(this.layer_id, layer_patch))
                .to.be.deep.equal({
                    type: 'PATCH_LAYER',
                    id: 'kin-1234:abcd',
                    patch: {
                        loaded: true,
                    },
                });
        });
    });

    describe('#async_load_layers', function () {
        // TODO: handle what could be caused by `fetch_check`?
        it('eventually dispatches `add_layers`', function () {
            const source_id = 'kin-1234';
            const reply = {
                layers: [
                    {
                        id: `${source_id}:abcd`,
                    },
                ],
            };
            fetch_mock.getOnce(`${API_BASE_URL}/sources/${source_id}/layers`, reply);

            const layers_promise = layers_actions.async_load_layers(
                source_id)(this.dispatch_spy);
            return expect(layers_promise)
                .to.be.fulfilled
                .then(() => {
                    expect(this.dispatch_spy).to.have.been.calledWith({
                        type: 'ADD_LAYERS',
                        layers: [
                            {
                                id: 'kin-1234:abcd',
                                loaded: false,
                            },
                        ],
                    });
                });
        });
    });

    describe('#async_toggle_selected_layer', function () {
        // TODO: handle what could be caused by `fetch_check`?
        it('eventually dispatches `PATCH_LAYER` (selecting)', function () {
            const reply = {
                layers: [
                    {
                        id: this.layer_id,
                        selected: true,
                    },
                ],
            };
            fetch_mock.patchOnce(`${API_BASE_URL}/layers/${escape(this.layer_id)}`, reply);

            const layers_promise = layers_actions.async_toggle_selected_layer(
                this.layer_id, true)(this.dispatch_spy);
            return expect(layers_promise)
                .to.be.fulfilled
                .then(() => {
                    expect(this.dispatch_spy).to.have.been.calledWith({
                        type: 'PATCH_LAYER',
                        id: 'kin-1234:abcd',
                        patch: {
                            selected: true,
                        },
                    });
                });
        });

        it('eventually dispatches `PATCH_LAYER` (deselecting)', function () {
            const reply = {
                layers: [
                    {
                        id: this.layer_id,
                        selected: false,
                    },
                ],
            };
            fetch_mock.patchOnce(`${API_BASE_URL}/layers/${escape(this.layer_id)}`, reply);

            const layers_promise = layers_actions.async_toggle_selected_layer(
                this.layer_id, false)(this.dispatch_spy);
            return expect(layers_promise)
                .to.be.fulfilled
                .then(() => {
                    expect(this.dispatch_spy)
                        .to.have.been.calledWith({
                            type: 'PATCH_LAYER',
                            id: 'kin-1234:abcd',
                            patch: {
                                events: [],
                                selected: false,
                                loaded: false,
                                sync_token: null,
                            },
                        });
                });
        });
    });

    afterEach(function () {
        fetch_mock.restore();
    });
});
