/*
 * @author David Menger
 */
'use strict';

const http = require('http');

/**
 * @private
 * @param {*} value - input
 * @returns {number|string}
 */
function normalizePort (value) {
    const parsedPort = parseInt(value, 10);

    if (isNaN(parsedPort)) {
        throw new Error('Port should be a number');
    }

    if (parsedPort >= 0) {
        // port number
        return parsedPort;
    }

    return false;
}

/**
 * Simpifies starting an Express.js server
 *
 * @param {any} app - server listener
 * @param {number|string} [port] - listening port, default 3000
 * @param {console} [log]
 * @param {process} [proc] - for testing purposes
 * @returns {{start:function,get:function}} description
 * @example
 * const express = ('express');
 * const { createWebserver } = require('prg-express');
 *
 * const app = express();
 * createWebserver(app).start();
 *
 */
function createWebserver (app, port = 3000, log = console, proc = process) {

    const server = http.createServer(app);

    // fetch port from environment variable
    const appPort = normalizePort(port);

    // or when there is an error
    server.on('error', (error) => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                log.error(`Port ${port} requires elevated privileges`);
                proc.exit(1);
                break;
            case 'EADDRINUSE':
                log.error(`Port ${port} is already in use`);
                proc.exit(1);
                break;
            default:
                throw error;
        }
    });

    return {
        /**
         * Starts the server
         * @memberof {createWebserver}
         *
         * @param {func} [onListen] - description
         * @returns {server}
         */
        start (onListen = () => {}) {
            server.listen(appPort, () => {
                const addr = server.address();
                log.log(`Listening on port ${addr.port}`);
                onListen(server);
            });
            return server;
        },
        /**
         * Returns app
         *
         * @memberof {createWebserver}
         * @returns {function|app}
         */
        get () {
            return app;
        }
    };
}

module.exports = createWebserver;
