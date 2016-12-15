/*
 * @author David Menger
 */
'use strict';

const sinon = require('sinon');
const errorLogger = require('../src/errorLogger');

const LOGGER_MOCK = {
    log () {},
    error () {},
    info () {},
    warn () {}
};

const REQ_MOCK = {
    originalUrl: '/foo/bar?q=1',
    route: null,
    query: { q: 1 },
    method: 'POST',
    body: { a: 1 }
};

describe('errorLogger()', function () {

    it('should make nice logs from http request', function () {
        const err = new Error('Text');
        err.code = err.status = 404;

        const req = Object.assign({}, REQ_MOCK, {

        });

        const expectedResponse = {
            body: REQ_MOCK.body,
            code: err.code,
            method: REQ_MOCK.method,
            query: REQ_MOCK.query,
            route: undefined,
            status: err.status || 500,
            url: REQ_MOCK.originalUrl
        };

        const logger = sinon.mock(LOGGER_MOCK);

        logger.expects('error').twice()
            .withArgs(err, expectedResponse);

        logger.expects('log').once()
            .withArgs(err, expectedResponse);

        logger.expects('warn').once()
            .withArgs(err, expectedResponse);

        logger.expects('info').once()
            .withArgs(err, expectedResponse);

        errorLogger(err, req, LOGGER_MOCK, null);
        errorLogger(err, req, LOGGER_MOCK, false);
        errorLogger(err, req, LOGGER_MOCK, 'error');
        errorLogger(err, req, LOGGER_MOCK);
        errorLogger(err, req, LOGGER_MOCK, 'log');
        errorLogger(err, req, LOGGER_MOCK, 'info');
        errorLogger(err, req, LOGGER_MOCK, 'warn');

        logger.verify();
    });

    it('should attach stacktrace and referrer for server errors', function () {
        const err = new Error('Text');
        err.code = 404;

        const req = Object.assign({}, REQ_MOCK, {
            headers: { referer: 'xy' }
        });

        const expectedResponse = {
            body: REQ_MOCK.body,
            code: err.code,
            method: REQ_MOCK.method,
            query: REQ_MOCK.query,
            route: undefined,
            status: err.status || 500,
            url: REQ_MOCK.originalUrl,
            stack: err.stack,
            referer: 'xy'
        };

        const logger = sinon.mock(LOGGER_MOCK);

        logger.expects('error').once()
            .withArgs(err, expectedResponse);

        errorLogger(err, req, LOGGER_MOCK);

        logger.verify();
    });


});
