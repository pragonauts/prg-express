/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const requestLogger = require('../src/requestLogger');
const express = require('express');
const sinon = require('sinon');
const supertestAsPromise = require('supertest-as-promised');

describe('#requestLogger', function () {

    it('should call performance callbacks', function () {
        const app = express();
        const callback = sinon.spy();

        app.use(requestLogger(callback));

        app.get('/url', (req, res) => res.send('OK'));

        const req = supertestAsPromise(app);

        return req.get('/url')
            .expect(200)
            .then((res) => {
                assert.equal(res.text, 'OK');

                assert(callback.calledOnce);
                const arg = callback.firstCall.args[0];

                assert.equal(arg.message, 'request');
                assert.equal(arg.method, 'GET');
                assert.equal(arg.status, 200);
                assert.equal(arg.url, '/url');
            });
    });

    it('should not call performance callbacks when mute is true', function () {
        const app = express();
        const callback = sinon.spy();

        app.use(requestLogger(callback, true));

        app.get('/url', (req, res) => res.send('OK'));

        const req = supertestAsPromise(app);

        return req.get('/url')
            .expect(200)
            .then((res) => {
                assert.equal(res.text, 'OK');
                assert(!callback.called);
            });
    });

});
