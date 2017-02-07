/*!
 * kin
 * Copyright(c) 2016-2017 Benoit Person
 * Apache 2.0 Licensed
 */


const expect = chai.expect;
const fetch_mock = require('fetch-mock');

const utils = require('../src/client/utils');
const connector_utils = require('../src/client/connector/utils');


// TODO: move this to share it accross tests
const API_BASE_URL = 'https://placeholder/1.0';


describe('connector', function () {
    describe('#get_params', function () {
        it('merges querystrings with distinct key spaces', function () {
            const search = 'key1=value1&key2=value2';
            const hash = 'key3=value3';

            expect(connector_utils.parse_params(search, hash))
                .to.deep.equal({
                    key1: 'value1',
                    key2: 'value2',
                    key3: 'value3',
                });
        });

        it('merges query strings with overlaping key spaces', function () {
            const search = 'key1=valueA';
            const hash = 'key1=valueB&key2=value2';

            expect(connector_utils.parse_params(search, hash))
                .to.deep.equal({
                    key1: ['valueA', 'valueB'],
                    key2: 'value2',
                });
        });
    });

    describe('#redirect_to_API', function () {
        beforeEach(function () {
            utils.rewire$location_redirect(this.location_redirect_spy = sinon.spy());
            this.dispatch_spy = sinon.spy();
        });

        afterEach(function () {
            utils.restore();
        });

        it('throws an error if no token', function () {
            const params = {};
            expect(() => connector_utils.redirect_to_API(params))
                .to.throw(connector_utils.KinConnectorError);
        });

        it('redirects to an url containing role, provider and token', function () {
            const params = {
                token: 'superAwesomeToken',
                role: 'role',
                provider: 'provider',
            };
            connector_utils.redirect_to_API(params);
            expect(this.location_redirect_spy)
                .to.be.calledOnce;

            const redirect_args = this.location_redirect_spy.args[0];
            expect(redirect_args[0])
                .to.have.string('superAwesomeToken')
                .to.have.string('role')
                .to.have.string('provider');
        });
    });

    describe('#send_oauth_code_to_API', function () {
        beforeEach(function () {
            utils.rewire$location_redirect(this.location_redirect_spy = sinon.spy());
        });

        afterEach(function () {
            fetch_mock.restore();
            utils.restore();
        });

        it('returns a promise', function () {
            const params = {
                role: 'authentication',
                provider: 'google',
                code: 'superLongOAuthCode',
            };

            const stub_reply = {
                status: 200,
                body: {
                    redirect: 'test',
                    ios_redirect: 'test_ios',
                },
            };
            const expected_uri = 'authentication/google/callback';
            // TODO: this might break with the order of querystring's stringify?
            const expected_qs = 'role=authentication&provider=google&code=superLongOAuthCode';
            fetch_mock.getOnce(`${API_BASE_URL}/${expected_uri}?${expected_qs}`, stub_reply);

            return expect(connector_utils.send_oauth_code_to_API(params))
                .to.be.fulfilled
                .then(() => {
                    expect(this.location_redirect_spy)
                        .to.have.been.calledWith('test');
                });
        });
    });

    describe('#validate_params', function () {
        it('return true for an allowed tuple (role, provider)', function () {
            const params = {
                role: 'authentication',
                provider: 'google',
            };
            expect(connector_utils.validate_params(params))
                .to.be.true;
        });

        it('return false for a not (yet?) allowed tuple (role, provider)', function () {
            const params = {
                role: 'authentication',
                provider: 'myspace', // I'm pretty sure we will never integrate with them ;)
            };
            expect(connector_utils.validate_params(params))
                .to.be.false;
        });

        it('return false for an uncomplete tuple (role, provider)', function () {
            const params = {
                role: 'authentication',
            };
            expect(connector_utils.validate_params(params))
                .to.be.false;
        });

        it('return false for a completely empty tuple (role, provider)', function () {
            const params = {};
            expect(connector_utils.validate_params(params))
                .to.be.false;
        });
    });
});
