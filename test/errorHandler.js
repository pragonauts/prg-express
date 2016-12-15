/*
 * @author David Menger
 */
'use strict';

const errorHandler = require('../src/errorHandler');
const sinon = require('sinon');
const assert = require('assert');

function factoryMocks (accepts, debug = false) {
    const handler = errorHandler('500', debug);

    const res = {
        headersSent: false,
        status () { return this; },
        json () { return this; },
        render () { return this; }
    };

    sinon.spy(res, 'status');
    sinon.spy(res, 'json');
    sinon.spy(res, 'render');

    const req = {
        accepts: () => accepts
    };

    let next;

    const promise = new Promise((resolve) => {
        next = sinon.spy(err => resolve(err));
    });

    return { handler, res, req, next, promise };
}

describe('errorHandler()', function () {

    it('should return nice error middleware with 500 status', function () {
        const { handler, res, req, next } = factoryMocks('json');

        const err = new Error('foo');

        handler(err, req, res, next);

        assert(res.status.calledOnce);
        assert.deepEqual(res.status.firstCall.args, [500]);
        assert(res.json.calledOnce);
        assert.deepEqual(res.json.firstCall.args, [{ error: 'foo', code: 500 }]);
        assert.strictEqual(res.render.called, false);
        assert.strictEqual(next.called, false);
    });

    it('should use status from error', function () {
        const { handler, res, req, next } = factoryMocks('json');

        const err = new Error('foo');
        err.status = 404;

        handler(err, req, res, next);

        assert(res.status.calledOnce);
        assert.deepEqual(res.status.firstCall.args, [404]);
        assert(res.json.calledOnce);
        assert.deepEqual(res.json.firstCall.args, [{ error: 'foo', code: 404 }]);
        assert.strictEqual(res.render.called, false);
        assert.strictEqual(next.called, false);
    });

    it('should use code from error', function () {
        const { handler, res, req, next } = factoryMocks('json');

        const err = new Error('foo');
        err.code = 123;

        handler(err, req, res, next);

        assert(res.status.calledOnce);
        assert.deepEqual(res.status.firstCall.args, [500]);
        assert(res.json.calledOnce);
        assert.deepEqual(res.json.firstCall.args, [{ error: 'foo', code: 123 }]);
        assert.strictEqual(res.render.called, false);
        assert.strictEqual(next.called, false);
    });

    it('should attach stacktrace, when debug is enabled', function () {
        const { handler, res, req, next } = factoryMocks('json', true);

        const err = new Error('foo');
        err.code = 123;

        handler(err, req, res, next);

        assert.equal(typeof res.json.firstCall.args[0].stack, 'string');
    });

    it('should render error template', function () {
        const { handler, res, req, next } = factoryMocks('html');

        const err = new Error('foo');

        handler(err, req, res, next);

        assert(res.status.calledOnce);
        assert.deepEqual(res.status.firstCall.args, [500]);
        assert(res.render.calledOnce);
        assert.deepEqual(res.render.firstCall.args, ['500', { error: 'foo', code: 500 }]);
        assert.strictEqual(res.json.called, false);
        assert.strictEqual(next.called, false);
    });

    it('should pass thru when response is not supported', function () {
        const { handler, res, req, next, promise } = factoryMocks('image');

        const err = new Error('foo');

        handler(err, req, res, next);

        assert.strictEqual(res.json.called, false);
        assert.strictEqual(res.render.called, false);
        assert.strictEqual(res.status.called, false);

        return promise.then((passedErr) => {
            assert.strictEqual(passedErr, err, 'should pass error');
        });
    });

    it('should pass thru when headers are sent', function () {
        const { handler, res, req, next, promise } = factoryMocks('json');

        res.headersSent = true;

        const err = new Error('foo');

        handler(err, req, res, next);

        assert.strictEqual(res.json.called, false);
        assert.strictEqual(res.render.called, false);
        assert.strictEqual(res.status.called, false);

        return promise.then((passedErr) => {
            assert.strictEqual(passedErr, err, 'should pass error');
        });
    });


});
