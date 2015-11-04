var app = require('express')();
var http = require('http').Server(app);
var config = require('./config.js');
var session = require('express-session');
var MongoStore = require('./resources/mongo/mongostore.js');

var store = new MongoStore(config.urls.mongo);

app.use(session({
  	secret: 'D58C9FFB11DAC',
  	store: store,
  	resave: false,
  	saveUninitialized: false
}));

require("./resources/prototypes/object.js");
var RecordBook = require('./resources/recordbook.js');
var book = new RecordBook();

var StaticAPI = require('./resources/staticapi.js');
var staticy = new StaticAPI(book);
staticy.bootstrap(app);
staticy.routes.library(app, 'get');
staticy.routes.index(app, 'get');

var RestAPI= require('./resources/restapi.js');
var rest = new RestAPI(book);
rest.bootstrap(app);
rest.routes.info(app, 'get');
rest.routes.compile(app, 'post');
rest.routes.scriptID(app, 'get');



http.listen(config.port, function() { console.log('listening on *: ' + config.port)});