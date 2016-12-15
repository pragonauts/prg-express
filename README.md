# Pragonauts Express Tools

Usefull tools for:

  - starting express app in one line
  - handling errors within Express.js with `app.use(errorMiddleware())`
  - throwing nice JSON errors with `res.throw(401);`
  - measuring request duration and logging with `app.use(requestLogger())`
  - cache some static data in templates using `hbsStaticHelpers`
  - having nice `new AppError('Missing attribute', 400, 4596)`
  - forcing slashes in url with `configurator`
  - redirecting to https with `configurator`
  - enabling trust proxy with `configurator`
  - enabling compression with `configurator`

-----------------

# API
## Classes

<dl>
<dt><a href="#{AppError}">{AppError}</a></dt>
<dd></dd>
<dt><a href="#AppError">AppError</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#createWebserver">createWebserver(app, [port], [log], [proc])</a> ⇒ <code>Object</code></dt>
<dd><p>Simpifies starting an Express.js server</p>
</dd>
<dt><a href="#configurator">configurator(app, httpConfig, [compressionMiddleware])</a></dt>
<dd></dd>
<dt><a href="#errorMiddleware">errorMiddleware([options], log)</a> ⇒ <code>errorMiddleware~error</code></dt>
<dd><p>Return error processing middleware</p>
</dd>
<dt><a href="#throwMiddleware">throwMiddleware(logger, muteLogs)</a> ⇒ <code>throwMiddleware~throwMid</code></dt>
<dd><p>Creates middleware, which allows simple logging and error responding in API</p>
</dd>
<dt><a href="#requestLogger">requestLogger(callback, [muteLogs])</a> ⇒ <code>requestLogger~logger</code></dt>
<dd><p>Creates express middleware for logging duration of requests</p>
</dd>
<dt><a href="#hbsStaticHelpers">hbsStaticHelpers(expressHbs, helpers, [data], [hbs])</a> ⇒ <code>ExpressHandlebars</code></dt>
<dd><p>Attaches compiler helpers which makes some static data compiled once</p>
</dd>
</dl>

<a name="{AppError}"></a>

## {AppError}
**Kind**: global class  
<a name="new_{AppError}_new"></a>

### new {AppError}()
Class with prepared status and code for {throwMiddleware} and for {errorMiddleware}

<a name="AppError"></a>

## AppError
**Kind**: global class  
<a name="new_AppError_new"></a>

### new AppError(error, status, code)
Creates an instance of AppError.


| Param | Type |
| --- | --- |
| error | <code>string</code> | 
| status | <code>number</code> | 
| code | <code>number</code> | 

<a name="createWebserver"></a>

## createWebserver(app, [port], [log], [proc]) ⇒ <code>Object</code>
Simpifies starting an Express.js server

**Kind**: global function  
**Returns**: <code>Object</code> - description  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| app | <code>any</code> |  | server listener |
| [port] | <code>number</code> &#124; <code>string</code> | <code>3000</code> | listening port, default 3000 |
| [log] | <code>console</code> |  |  |
| [proc] | <code>process</code> |  | for testing purposes |

**Example**  
```javascript
const express = ('express');
const { createWebserver } = require('prg-express');

const app = express();
createWebserver(app).start();
```
<a name="configurator"></a>

## configurator(app, httpConfig, [compressionMiddleware])
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>Express</code> | application |
| httpConfig | <code>object</code> | the configuration |
| [httpConfig.zlib] | <code>object</code> &#124; <code>boolean</code> | compression configuration |
| [httpConfig.forceSlashes] | <code>boolean</code> &#124; <code>null</code> | forcing slashes |
| [httpConfig.trustProxy] | <code>boolean</code> | enables proxytrust |
| [httpConfig.isUsingSsl] | <code>boolean</code> | forces https |
| [httpConfig.excludeRedirectPaths] | <code>array</code> | forces https |
| [compressionMiddleware] | <code>func</code> |  |

**Example**  
```javascript
// theese are default values
const { configurator } = require('prg-express');

configurator(app, {
     zlib: { threshold: 1024 },// true=enable with default params, false=dont attach zlib
     forceSlashes: false,      // true=with slashes, false=without slashes, null=dont redirect
     trustProxy: true,
     isUsingSsl: false,        // redirect to https
     redirectWww: true,        // redirect from www to base domain
     excludeRedirectPaths: []  // exlude from forcing slashes
});
```
<a name="errorMiddleware"></a>

## errorMiddleware([options], log) ⇒ <code>errorMiddleware~error</code>
Return error processing middleware

**Kind**: global function  
**Returns**: <code>errorMiddleware~error</code> - - the middleware  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> |  |
| log | <code>console</code> | the logger |

**Example**  
```javascript
const { errorMiddleware } = require('prg-express');

app.use(errorMiddleware({
     errorView: '500', // error template name
     attachStackTraces: false,
     logLevel: 'error', // which method will be called on log object
     mute: false        // mutes error logging for testing purposes
}));
```
<a name="throwMiddleware"></a>

## throwMiddleware(logger, muteLogs) ⇒ <code>throwMiddleware~throwMid</code>
Creates middleware, which allows simple logging and error responding in API

**Kind**: global function  
**Returns**: <code>throwMiddleware~throwMid</code> - - the middleware  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| logger | <code>console</code> |  | where to log |
| muteLogs | <code>boolean</code> | <code>false</code> | use true for tests |

**Example**  
```javascript
const express = require('express');

const app = express();

app.use(throwMiddleware());

app.get('/', (req, res) => {
     res.throw(401, 'Unauthorized'); // log as info
     // responds with { code: 401, error: 'Unauthorized' }
     res.throw(403);                 // log as info with default message
     res.throw(401, true);           // log as error

     const err = new Error('Failed');
     err.code = 345;   // will be used in response json
     err.status = 400; // will be used as http status
     res.throw(err);

     const err = new Error('Failed');
     err.code = 457;   // will be used in response json
     res.throw(err);   // status will be set regarding to first digit of code
});
```
<a name="requestLogger"></a>

## requestLogger(callback, [muteLogs]) ⇒ <code>requestLogger~logger</code>
Creates express middleware for logging duration of requests

**Kind**: global function  
**Returns**: <code>requestLogger~logger</code> - - returns the middleware  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| callback | <code>func</code> |  | called, when request is finnished |
| [muteLogs] | <code>boolean</code> | <code>false</code> | mutes logs for testing |

**Example**  
```javascript
app.use(requestLogger((data) => {
     const {
         message,
         url,
         method,
         responseTime,
         status,
         referrer,
         remoteAddr
     } = data;
}));
```
<a name="hbsStaticHelpers"></a>

## hbsStaticHelpers(expressHbs, helpers, [data], [hbs]) ⇒ <code>ExpressHandlebars</code>
Attaches compiler helpers which makes some static data compiled once

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| expressHbs | <code>ExpressHandlebars</code> | Express Handlebars |
| helpers | <code>Object</code> | map of helpers |
| [data] | <code>Object</code> | static data |
| [hbs] | <code>Handlebars</code> | handlebars library |

**Example**  
```javascript
const { hbsStaticHelpers } = require('prg-express');

// setup templating
const hbs = expressHandlebars.create({
    defaultLayout: 'index',
    extname: '.hbs',
    layoutsDir: LAYOUTS_PATH,
    partialsDir: VIEWS_PATH,
    helpers
});

// setup template caching
if (!config.debugEnabled) {
    app.enable('view cache');
}

// setup compile-time helpers {{$xkf kdkd}}
hbsStaticHelpers(hbs, helpers, app.locals);

// attach template engine
app.set('views', VIEWS_PATH);
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// will be staticly executed in compilation time
{{$staticHelper 'param'}}
// will be staticly loaded from data
{{$dataParam}}
```
