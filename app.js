var express = require("express");
var app = express();
var http = require("http").Server(app);

var config = require("./config.js");
var PGClient = require("./libs/eval_pgclient");
var pgclient = new PGClient('postgres://vagrant:password@localhost/eval');

app.use("/newsfeed.js", express.static("./libs/newsfeed/index.js"));
app.use("/materialize", express.static("./node_modules/materialize-css/dist"));
app.use("/jquery.js", express.static("./node_modules/jquery/dist/jquery.min.js"));
app.use("/require.js", express.static("./node_modules/requirejs/require.js"));
app.use("/knockout.js", express.static("./node_modules/knockout/build/output/knockout-latest.js"));
app.use("/underscore.js", express.static("./node_modules/underscore/underscore-min.js"));
app.use("/backbone.js", express.static("./node_modules/backbone/backbone-min.js"));
app.use("/ace-builds", express.static("./node_modules/ace-builds"));

var zmq = require("zmq");
var WORK_URL = "tcp://127.0.0.1:3000";
var req = zmq.socket("req");
req.identity = "client" + process.pid;

req.bind(WORK_URL, function(err) {
	if(err) throw err;

	var StaticAPI = require("./resources/staticapi.js");
	var staticy = new StaticAPI();

	var RestAPI= require("./resources/restapi.js");
	var rest = new RestAPI(req, pgclient, app);

	http.listen(config.port, function() { console.log("listening on *: " + config.port); });
})
