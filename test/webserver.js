/*
 * @author David Menger
 */
'use strict';

const assert = require('assert');
const webserver = require('../src/webserver');
const sinon = require('sinon');

describe('#webserver()', function () {

    it('should create the listening webserver', function (done) {
        const app = sinon.spy();
        const log = {
            log: sinon.spy(),
            error: sinon.spy()
        };
        const proc = {
            exit: sinon.spy()
        };
        const listener = webserver(app, 54732, log, proc);

        assert.equal(typeof listener, 'object');
        assert.equal(typeof listener.get, 'function');
        assert.equal(typeof listener.start, 'function');

        assert.strictEqual(listener.get(), app);

        listener.start((server) => {

            assert(log.log.calledOnce);

            assert.throws(() => {
                server.emit('error', new Error('any'));
            });

            const err = new Error();
            err.syscall = 'listen';

            // should exit when there are no privileges
            err.code = 'EACCES';
            server.emit('error', err);
            assert(proc.exit.calledOnce);

            // should exit when address is used
            err.code = 'EADDRINUSE';
            server.emit('error', err);
            assert(proc.exit.calledTwice);

            // should throw it out
            err.code = 'OTHER';
            assert.throws(() => {
                server.emit('error', err);
            });

            server.close(() => {
                done();
            });
        });
    });

    it('should work with zero', function (done) {
        const app = sinon.spy();
        const log = {
            log: sinon.spy(),
            error: sinon.spy()
        };
        const proc = {
            exit: sinon.spy()
        };
        const listener = webserver(app, -1, log, proc);

        assert.strictEqual(listener.get(), app);

        listener.start((server) => {

            assert(log.log.calledOnce);

            server.close(() => {
                done();
            });
        });
    });

    it('should throw error', function () {
        const app = sinon.spy();
        const log = {
            log: sinon.spy(),
            error: sinon.spy()
        };
        const proc = {
            exit: sinon.spy()
        };

        assert.throws(() => {
            webserver(app, 'test', log, proc);
        });
    });

});
