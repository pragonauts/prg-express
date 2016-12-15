/*
 * @author David Menger
 */
'use strict';

const throwMiddleware = require('../src/throwMiddleware');
const sinon = require('sinon');
const assert = require('assert');

function testResponse (status, response, logmethod = 'info') {
    const logger = { error () {}, info () {} };
    const req = {};
    const res = { status () { return this; }, send () { return this; } };

    const loggerMock = sinon.mock(logger);

    sinon.spy(res, 'status');
    sinon.spy(res, 'send');

    if (!logmethod) {
        loggerMock.expects('info').never();
        loggerMock.expects('error').never();
    } else {
        loggerMock.expects(logmethod).once();
    }

    const next = sinon.spy();

    throwMiddleware(logger, !logmethod)(req, res, next);

    assert(next.called);
    assert(typeof res.throw === 'function', 'should attach throw method to res');

    return {
        throw (...args) {
            res.throw(...args);

            loggerMock.verify();
            assert.deepEqual(res.status.firstCall.args[0], status);
            assert(res.status.withArgs(status).calledOnce, 'status should be called once');
            assert.deepEqual(res.send.firstCall.args[0], response);
        }
    };
}

describe('throwMiddleware', function () {

    it('should accept first code and then message', function () {
        const res = testResponse(400, { code: 475, error: 'Bar' });
        res.throw(475, 'Bar');
    });

    it('should accept just code and generalize message', function () {
        let res = testResponse(400, { code: 475, error: 'Bad Request' });
        res.throw(475);

        res = testResponse(500, { code: 500, error: 'Server Error' });
        res.throw(500);

        res = testResponse(401, { code: 401, error: 'Unauthorized' });
        res.throw(401);

        res = testResponse(403, { code: 403, error: 'Forbidden' });
        res.throw(403);

        res = testResponse(400, { code: 400, error: 'Bad Request' });
        res.throw(400);

        res = testResponse(404, { code: 404, error: 'Not Found' });
        res.throw(404);
    });

    it('and should not log anything, when mute is issued', function () {
        const res = testResponse(400, { code: 475, error: 'Bar' }, false);
        res.throw('Bar', 475);
    });

    it('should accept first message and then code', function () {
        const res = testResponse(400, { code: 475, error: 'Bar' });
        res.throw('Bar', 475);
    });

    it('should accept error object', function () {
        let res = testResponse(404, { code: 475, error: 'Bar' });
        let err = new Error('Bar');
        err.status = 404;
        err.code = 475;
        res.throw(err);

        res = testResponse(404, { code: 404, error: 'Bar' });
        err = new Error('Bar');
        err.status = 404;
        res.throw(err);

        res = testResponse(400, { code: 450, error: 'Bad Request' });
        err = new Error();
        err.code = 450;
        res.throw(err);
    });

    it('should prefer error code from throw method', function () {
        const res = testResponse(400, { code: 425, error: 'Bar' });
        const err = new Error('Bar');
        err.status = 404;
        res.throw(err, 425);
    });

    it('should prefer error code from throw method', function () {
        const res = testResponse(400, { code: 425, error: 'Bar' }, 'error');
        const err = new Error('Bar');
        err.status = 404;
        res.throw(err, 425, true);
    });

    it('should prefer error code from throw method', function () {
        const res = testResponse(404, { code: 404, error: 'Bar' }, 'error');
        const err = new Error('Bar');
        err.status = 404;
        res.throw(err, true);
    });

    it('should not override bad error code from error object', function () {
        let res = testResponse(475, { code: 475, error: 'Bar' });
        let err = new Error('Bar');
        err.status = 475;
        res.throw(err);

        res = testResponse(475, { code: 404, error: 'Bar' });
        err = new Error('Bar');
        err.status = 475;
        err.code = 404;
        res.throw(err);
    });

});
