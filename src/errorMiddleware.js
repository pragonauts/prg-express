/*
 * @author David Menger
 */
'use strict';

const errorHandler = require('./errorHandler');
const errorLogger = require('./errorLogger');

/**
 * Return error processing middleware
 *
 * @param {{errorView:string,attachStackTraces:boolean,logLevel:string,mute:boolean}} [options]
 * @param {console} log - the logger
 * @returns {errorMiddleware~error} - the middleware
 * @example
 * const { errorMiddleware } = require('prg-express');
 *
 * app.use(errorMiddleware({
 *      errorView: '500', // error template name
 *      attachStackTraces: false,
 *      logLevel: 'error', // which method will be called on log object
 *      mute: false        // mutes error logging for testing purposes
 * }));
 */
function errorMiddleware (options = {}, log = console) {
    const config = {
        errorView: '500',
        attachStackTraces: false,
        logLevel: 'error',
        mute: false
    };

    Object.assign(config, options);

    const handleError = errorHandler(config.errorView, config.attachStackTraces);

    return function error (err, req, res, next) {
        if (!config.mute) {
            errorLogger(err, req, log, config.logLevel);
        }
        handleError(err, req, res, next);
    };
}

module.exports = errorMiddleware;
