var app = require('express')();
var http = require('http').Server(app);
var config = require('./config.js');
require("./resources/prototypes/object.js");

var StaticAPI = require('./resources/staticapi.js');
var staticy = new StaticAPI();
staticy.bootstrap(app);
staticy.routes.library(app, 'get');
staticy.routes.index(app, 'get');

var RestAPI= require('./resources/restapi.js');
var rest = new RestAPI();
rest.bootstrap(app);
rest.routes.info(app, 'get');
rest.routes.compile(app, 'post');
rest.routes.scriptID(app, 'get');

http.listen(config.port, function() { console.log('listening on *: ' + config.port)});