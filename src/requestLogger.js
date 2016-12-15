/*
 * @author David Menger
 */
'use strict';

const onFinished = require('on-finished');
const onHeaders = require('on-headers');

/**
 * Get request IP address.
 *
 * @private
 * @param {IncomingMessage} req
 * @returns {string}
 */
function getip (req) {
    return req.ip ||
        req._remoteAddress ||
        (req.connection && req.connection.remoteAddress);
}

/**
 * @private
 * Record the start time.
 */
function recordStartTime () {
    this._startAt = process.hrtime();
    this._startTime = new Date();
}

/**
 * Creates express middleware for logging duration of requests
 *
 * @param {func} callback - called, when request is finnished
 * @param {boolean} [muteLogs] - mutes logs for testing
 * @returns {requestLogger~logger} - returns the middleware
 * @example
 * app.use(requestLogger((data) => {
 *      const {
 *          message,
 *          url,
 *          method,
 *          responseTime,
 *          status,
 *          referrer,
 *          remoteAddr
 *      } = data;
 * }));
 */
function requestLogger (callback, muteLogs = false) {
    return function logger (req, res, next) {

        if (muteLogs) {
            next();
            return;
        }

        // request data
        Object.assign(req, {
            _startAt: undefined,
            _startTime: undefined,
            _remoteAddress: getip(req)
        });

        // response data
        Object.assign(req, {
            _startAt: undefined,
            _startTime: undefined
        });

        // record request start
        recordStartTime.call(req);

        function logRequest () {
            let ms;

            if (req._startAt && res._startAt) {
                ms = ((res._startAt[0] - req._startAt[0]) * 1e3)
                     + ((res._startAt[1] - req._startAt[1]) * 1e-6);
            }

            callback({
                message: 'request',
                url: req.originalUrl || req.url,
                method: req.method,
                responseTime: ms && ms.toFixed(3),
                status: res._header && `${res.statusCode}`,
                referrer: req.headers.referer || req.headers.referrer,
                remoteAddr: getip(req)
            });
        }

        onHeaders(res, recordStartTime);

        // log when response finished
        onFinished(res, logRequest);

        next();
    };
}

module.exports = requestLogger;
