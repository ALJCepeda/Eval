var zmq = require("zmq"),
	req = zmq.socket("req");

WORK_URL = "tcp://127.0.0.1:3000";

req.connect(WORK_URL);

req.on("message", function(msg) {
	console.log("response: ", msg.toString());
});

var workid = 0;
setInterval(function(){
	workid++;
  	console.log("request: ", workid);
  	req.send(workid.toString());
}, 500);

/*
var app = require("express")();
var http = require("http").Server(app);
var config = require("./config.js");

require("./resources/prototypes/object.js");
var RecordBook = require("./resources/recordbook.js");
var book = new RecordBook();

var StaticAPI = require("./resources/staticapi.js");
var staticy = new StaticAPI(book);
staticy.bootstrap(app);
staticy.routes.index(app, "get");

var RestAPI= require("./resources/restapi.js");
var rest = new RestAPI(book);
rest.bootstrap(app);
rest.routes.info(app, "get");
rest.routes.compile(app, "post");
rest.routes.scriptID(app, "get");

http.listen(config.port, function() { console.log("listening on *: " + config.port); });
*/
