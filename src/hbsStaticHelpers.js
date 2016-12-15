/*
 * @author David Menger
 */
'use strict';

const handlebars = require('handlebars');

const COMPILE_TIME_REGEX = /\{\{\$([^}#/\s]+\s[^}]+)\}\}/ig;
const SINGLE_QUTES = /^'([^']*)'$/;
const DOUBLE_QUTES = /^"([^"]*)"$/;

function parse (template, helpers, data) {
    return template.replace(COMPILE_TIME_REGEX, (match, contents) => {
        const [name, ...args] = contents.split(' ');
        const tag = `{{${contents}}}`;

        if (typeof helpers[name] !== 'function') {
            return tag;
        }

        args.push({
            tag,
            name,
            data,
            fn: () => ''
        });

        return helpers[name]
            .apply(data, args.map((arg) => {
                if (typeof arg !== 'string') {
                    return arg;
                }

                if (arg === 'true') {
                    return true;
                } else if (arg === 'false') {
                    return false;
                }

                let argMatch = arg.match(SINGLE_QUTES);
                if (argMatch) {
                    return argMatch[1];
                }

                argMatch = arg.match(DOUBLE_QUTES);
                if (argMatch) {
                    return argMatch[1];
                }

                return data[arg];
            }));
    });
}

/**
 * Attaches compiler helpers which makes some static data compiled once
 *
 * @param {ExpressHandlebars} expressHbs - Express Handlebars
 * @param {Object} helpers - map of helpers
 * @param {Object} [data] - static data
 * @param {Handlebars} [hbs] - handlebars library
 * @returns {ExpressHandlebars}
 *
 * @example
 * const { hbsStaticHelpers } = require('prg-express');
 *
 * // setup templating
 * const hbs = expressHandlebars.create({
 *     defaultLayout: 'index',
 *     extname: '.hbs',
 *     layoutsDir: LAYOUTS_PATH,
 *     partialsDir: VIEWS_PATH,
 *     helpers
 * });
 *
 * // setup template caching
 * if (!config.debugEnabled) {
 *     app.enable('view cache');
 * }
 *
 * // setup compile-time helpers {{$xkf kdkd}}
 * hbsStaticHelpers(hbs, helpers, app.locals);
 *
 * // attach template engine
 * app.set('views', VIEWS_PATH);
 * app.engine('hbs', hbs.engine);
 * app.set('view engine', 'hbs');
 *
 * // will be staticly executed in compilation time
 * {{$staticHelper 'param'}}
 * // will be staticly loaded from data
 * {{$dataParam}}
 */
function hbsStaticHelpers (expressHbs, helpers, data = {}, hbs = handlebars) {
    const compatData = Object.assign({}, data, {
        root: data
    });
    return Object.assign(expressHbs, {
        _compileTemplate: (template, options) =>
            hbs.compile(parse(template, helpers, compatData), options)
    });
}

module.exports = hbsStaticHelpers;
