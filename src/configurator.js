/*
 * @author David Menger
 */
'use strict';

const { looksLikeFile } = require('webalize');
const compression = require('compression');

/* eslint max-len: 0 */
/**
 *
 * @param {Express} app - application
 * @param {object} httpConfig - the configuration
 * @param {object|boolean} [httpConfig.zlib] - compression configuration
 * @param {boolean|null} [httpConfig.forceSlashes] - forcing slashes
 * @param {boolean} [httpConfig.trustProxy] - enables proxytrust
 * @param {boolean} [httpConfig.isUsingSsl] - forces https
 * @param {array} [httpConfig.excludeRedirectPaths] - forces https
 * @param {func} [compressionMiddleware]
 * @example
 * // theese are default values
 * const { configurator } = require('prg-express');
 *
 * configurator(app, {
 *      zlib: { threshold: 1024 },// true=enable with default params, false=dont attach zlib
 *      forceSlashes: false,      // true=with slashes, false=without slashes, null=dont redirect
 *      trustProxy: true,
 *      isUsingSsl: false,        // redirect to https
 *      redirectWww: true,        // redirect from www to base domain
 *      excludeRedirectPaths: []  // exlude from forcing slashes
 * });
 */
function configurator (app, httpConfig, compressionMiddleware = compression) {

    const config = {
        zlib: { threshold: 1024 },
        forceSlashes: false,
        trustProxy: true,
        isUsingSsl: false,
        redirectWww: true,
        excludeRedirectPaths: []
    };

    Object.assign(config, httpConfig);

    // optional ZLIB compression
    if (config.zlib) {
        const zLibConfig = {};
        if (typeof config.zlib === 'object') {
            Object.assign(zLibConfig, config.zlib);
        }
        app.use(compressionMiddleware(zLibConfig));
    }

    // force trailing slash redirect
    const { forceSlashes, excludeRedirectPaths } = config;

    if (typeof forceSlashes === 'boolean') {
        app.use((req, res, next) => {
            if (looksLikeFile(req.url)
                || req.method !== 'GET'
                || excludeRedirectPaths.some(r => req.path.match(r))) {

                return next();
            }
            const slashInTheEnd = req.path.substr(-1) === '/';

            if (!forceSlashes && slashInTheEnd && req.path !== '/') {
                const query = req.url.slice(req.path.length);
                return res.redirect(301, req.path.slice(0, -1) + query);
            } else if (forceSlashes && !slashInTheEnd) {
                const query = req.url.slice(req.path.length);
                return res.redirect(301, `${req.path}/${query}`);
            }

            return next();
        });
    }

    if (config.trustProxy) {
        app.enable('trust proxy');
    }

    if (config.redirectWww) {
        const FULL_WWW_REGEX = /^www\./i;
        app.use((req, res, next) => {
            if (req.hostname.match(FULL_WWW_REGEX)) {
                const hostWithoutWww = req.get('host').replace(FULL_WWW_REGEX, '');
                res.redirect(301, `${config.isUsingSsl ? 'https' : req.protocol}://${hostWithoutWww}${req.url}`);
            } else {
                next();
            }
        });
    }

    if (config.isUsingSsl) {
        app.use((req, res, next) => {
            if (!req.secure) {
                const host = req.get('host');
                res.redirect(301, `https://${host}${req.url}`);
            } else {
                next();
            }
        });
    }
}

module.exports = configurator;
