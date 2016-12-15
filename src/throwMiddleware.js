/*
 * @author David Menger
 */
'use strict';

const errorLogger = require('./errorLogger');
const AppError = require('./AppError');

const KNOWN_HTTP_CODES = [401, 403, 404, 400, 429, 500];

function statusCode (errorCode) {
    if (KNOWN_HTTP_CODES.indexOf(errorCode) !== -1) {
        return errorCode;
    }

    if (`${errorCode}`[0] === '4') {
        return 400;
    }

    return 500;
}

function niceErrorCodes (status) {
    switch (status) {
        case 404:
            return 'Not Found';
        case 401:
            return 'Unauthorized';
        case 403:
            return 'Forbidden';
        case 400:
            return 'Bad Request';
        default:
            return 'Server Error';
    }
}

/**
 * @private
 *
 * @param {string|number|Error} exception
 * @param {number|string|boolean} [code]
 * @param {boolean} [logAsError]
 * @returns {{status,code,message,shouldLog}}
 */
function parseArgs (exception, code, logAsError) {
    let message = exception;
    let exceptionCode = code || 500;
    let shouldLog = logAsError;
    let exceptionStatus = null;

    if (typeof code === 'boolean') {
        exceptionCode = 500;
        shouldLog = code;
    }

    if (exception instanceof Error) {
        message = exception.message || null;
        exceptionCode = null;
        if (typeof code === 'number') {
            exceptionStatus = statusCode(code);
            exceptionCode = code;
        } else if (exception.status) {
            exceptionStatus = exception.status;
        } else if (exception.code) {
            exceptionStatus = statusCode(exception.code);
        } else {
            exceptionStatus = exceptionCode;
        }
        exceptionCode = exceptionCode || exception.code || exceptionStatus || 500;
    } else if (typeof exception === 'number') {
        exceptionCode = exception;
        if (typeof code === 'string') {
            message = code;
        } else {
            message = null;
        }
    }

    const status = exceptionStatus || statusCode(exceptionCode);

    if (!message) {
        message = niceErrorCodes(status);
    }

    return {
        status,
        code: exceptionCode,
        message,
        shouldLog
    };
}

/**
 * Creates middleware, which allows simple logging and error responding in API
 *
 * @param {console} logger - where to log
 * @param {boolean} muteLogs - use true for tests
 * @returns {throwMiddleware~throwMid} - the middleware
 * @example
 * const express = require('express');
 *
 * const app = express();
 *
 * app.use(throwMiddleware());
 *
 * app.get('/', (req, res) => {
 *      res.throw(401, 'Unauthorized'); // log as info
 *      // responds with { code: 401, error: 'Unauthorized' }
 *      res.throw(403);                 // log as info with default message
 *      res.throw(401, true);           // log as error
 *
 *      const err = new Error('Failed');
 *      err.code = 345;   // will be used in response json
 *      err.status = 400; // will be used as http status
 *      res.throw(err);
 *
 *      const err = new Error('Failed');
 *      err.code = 457;   // will be used in response json
 *      res.throw(err);   // status will be set regarding to first digit of code
 * });
 */
function throwMiddleware (logger = console, muteLogs = false) {
    return function throwMid (req, res, next) {
        Object.assign(res, {
            throw (exception, code, logAsError) {
                const parsed = parseArgs(exception, code, logAsError);

                if (!muteLogs) {
                    errorLogger(
                        new AppError(parsed.message, parsed.status, parsed.code),
                        req,
                        logger,
                        parsed.shouldLog ? 'error' : 'info'
                    );
                }

                this.status(parsed.status)
                    .send({ code: parsed.code, error: parsed.message });
            }
        });
        next();
    };
}

module.exports = throwMiddleware;
