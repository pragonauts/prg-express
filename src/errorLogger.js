/*
 * @author David Menger
 */
'use strict';

/**
 * @private
 *
 * @param {AppError} err
 * @param {express.Request} req
 * @param {any} log
 * @param {string} [logLevel='error']
 */
function errorLogger (err, req, log, logLevel = 'error') {
    const metaData = {
        code: err.code,
        status: err.status || 500,
        url: req.originalUrl,
        route: req.route ? req.route.path : req.path,
        query: req.query,
        method: req.method,
        body: req.body
    };

    if (req.headers && req.headers.referer) {
        metaData.referer = req.headers.referer;
    }

    if (err.status === 500 || !err.status) {
        metaData.stack = err.stack;
    }

    switch (logLevel) {
        case null:
        case false:
            break;
        case 'info':
            log.info(err, metaData);
            break;
        case 'log':
            log.log(err, metaData);
            break;
        case 'warn':
            log.warn(err, metaData);
            break;
        case 'error':
        default:
            log.error(err, metaData);
    }
}

module.exports = errorLogger;
