/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const configurator = require('../src/configurator');
const express = require('express');
const sinon = require('sinon');
const supertestAsPromise = require('supertest-as-promised');

describe('#configurator()', function () {

    it('should attach compressor', function () {
        const handler = () => {};
        const compressor = sinon.spy(() => handler);
        const app = express();
        const useSpy = sinon.spy(app, 'use');

        configurator(app, { zlib: true }, compressor);

        assert(compressor.called);
        assert.equal(typeof compressor.firstCall.args[0], 'object');
        assert.strictEqual(useSpy.firstCall.args[0], handler);
    });

    it('should not attach compressor', function () {
        const handler = () => {};
        const compressor = sinon.spy(() => handler);
        const app = express();
        const useSpy = sinon.spy(app, 'use');

        configurator(app, { zlib: false }, compressor);

        assert(!compressor.called);
        assert.notStrictEqual(useSpy.firstCall.args[0], handler);
    });

    it('should enable trust proxy', function () {
        const app = express();
        const enableSpy = sinon.spy(app, 'enable');

        configurator(app, { trustProxy: true });

        assert(enableSpy.called);
        assert.strictEqual(enableSpy.firstCall.args[0], 'trust proxy');
    });

    it('should enable trust proxy', function () {
        const app = express();
        const enableSpy = sinon.spy(app, 'enable');

        configurator(app, { trustProxy: false });

        assert(!enableSpy.called);
    });

    it('should redirect links without ssl, when option is true', function () {
        const app = express();

        configurator(app, { isUsingSsl: true });

        const req = supertestAsPromise(app);

        return req.get('/url')
            .expect(301)
            .then((res) => {
                assert(res.header.location.match(/^https/));
            });
    });

    it('should redirect hosts without www', function () {
        const app = express();

        configurator(app, { isUsingSsl: true });

        const req = supertestAsPromise(app);

        return req.get('/url')
            .set('host', 'www.host.cz')
            .expect(301)
            .then((res) => {
                assert(res.header.location.match(/^https:\/\/host\.cz/));
            });
    });

    it('should redirect urls without slash', function () {
        const app = express();

        configurator(app, { forceSlashes: false });

        const req = supertestAsPromise(app);

        return req.get('/url/?code=1')
            .expect(301)
            .then((res) => {
                assert(res.header.location.match(/\/url\?code=1$/));
            });
    });

    it('should redirect urls with slash', function () {
        const app = express();

        configurator(app, { forceSlashes: true });

        const req = supertestAsPromise(app);

        return req.get('/url?code=1')
            .expect(301)
            .then((res) => {
                assert(res.header.location.match(/\/url\/\?code=1$/));
            });
    });

    it('should not redirect images', function () {
        const app = express();

        configurator(app, { forceSlashes: true });

        const req = supertestAsPromise(app);

        return req.get('/image.png')
            .expect(404);
    });

    it('should not redirect excluded urls', function () {
        const app = express();

        configurator(app, { forceSlashes: true, excludeRedirectPaths: [/\/url/] });

        const req = supertestAsPromise(app);

        return req.get('/url')
            .expect(404);
    });

    it('should not redirect posts', function () {
        const app = express();

        configurator(app, { forceSlashes: true });

        const req = supertestAsPromise(app);

        return req.post('/url')
            .expect(404);
    });

    it('should pass request, when its ok', function () {
        const app = express();

        configurator(app, { forceSlashes: false, excludeRedirectPaths: [/\/foo/] });

        app.get('/url', (req, res) => res.send('OK'));

        const req = supertestAsPromise(app);

        return req.get('/url')
            .expect(200)
            .then((res) => {
                assert.equal(res.text, 'OK');
            });
    });

    it('should pass requests when redirect is null', function () {
        const app = express();

        configurator(app, { forceSlashes: null });

        app.get('/url', (req, res) => res.send('OK'));

        const req = supertestAsPromise(app);

        return req.get('/url')
            .expect(200)
            .then((res) => {
                assert.equal(res.text, 'OK');

                return req.get('/url/')
                    .expect(200);
            })
            .then((res) => {
                assert.equal(res.text, 'OK');
            });
    });

});
