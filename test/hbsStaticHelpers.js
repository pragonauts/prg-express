/*
 * @author David Menger
 */
'use strict';

const hbsStaticHelpers = require('../src/hbsStaticHelpers');
const path = require('path');
const assert = require('assert');
const sinon = require('sinon');
const expressHandlebars = require('express-handlebars');

describe('#hbsStaticHelpers()', function () {

    it('should replace original _compileTemplate method with own preprocessor', function (done) {

        const staticHelpers = {
            helper: () => 'response'
        };

        const dynamicHelpers = {
            helper: () => 'bad response',
            nonexisting: x => x
        };

        sinon.spy(staticHelpers, 'helper');

        const hbs = expressHandlebars.create({
            helpers: dynamicHelpers,
            extname: '.hbs'
        });

        const data = {
            foo: 'foo',
            bar: 'bar'
        };

        hbsStaticHelpers(hbs, staticHelpers, data);

        hbs.renderView(path.join(__dirname, 'mock.hbs'), {
            settings: { views: __dirname },
            data: { shouldBeUndef: 'fail' }
        }, (err, res) => {
            if (err) {
                done(err);
                return;
            }

            assert.equal(res, '<h1>response-helper</h1><b>response</b>foo');
            assert(staticHelpers.helper.calledTwice, 'helper should be called twice');

            const args = staticHelpers.helper.firstCall.args;
            const options = args.pop();

            assert.equal(options.data.foo, 'foo');
            assert.equal(options.data.bar, 'bar');
            assert.equal(options.data.root.foo, 'foo');
            assert.equal(options.data.root.bar, 'bar');

            assert.deepStrictEqual(
                args,
                ['false', 'true', undefined, true, false, 'foo', 'bar']
            );

            const args2 = staticHelpers.helper.secondCall.args;
            args2.pop();

            assert.deepStrictEqual(
                args2,
                ['string']
            );

            done();
        });

    });

});
