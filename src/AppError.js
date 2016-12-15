/*
 * @author David Menger
 */
'use strict';

/**
 * Class with prepared status and code for {throwMiddleware} and for {errorMiddleware}
 *
 * @class {AppError}
 */
class AppError extends Error {

    /**
     * Creates an instance of AppError.
     *
     * @param {string} error
     * @param {number} status
     * @param {number} code
     */
    constructor (error, status, code) {
        super(error);

        this.status = status;

        this.code = code || status;
    }

}

module.exports = AppError;
