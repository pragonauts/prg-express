/*
 * @author David Menger
 */
'use strict';

function errorHandler (errorView = '500', attachStackTraces = false) {

    return function handler (err, req, res, next) {
        if (res.headersSent) {
            next(err);
            return;
        }

        const status = err.status || 500;
        const code = err.code || status;
        const data = Object.assign({}, err.data, { error: err.message, code });

        if (attachStackTraces) {
            data.stack = err.stack;
        }

        switch (req.accepts(['json', 'html'])) {
            case 'json':
                res.status(status)
                    .json(data);
                break;
            case 'html':
                res.status(status)
                    .render(errorView, data);
                break;
            default:
                next(err);
        }
    };
}

module.exports = errorHandler;
