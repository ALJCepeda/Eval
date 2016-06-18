var zmq = require("zmq");
var bodyparser = require("body-parser");
var config = require("../config.js");


var RestAPI = function(workURL, pgdb, app) {
	var self = this;

	var jsoner = bodyparser.json();
	this.workurl = workURL;
	//this.keeper = book.keeper("restapi");
	this.routes = {};

	//this.info.themes = config.aceThemes;

	app.use(jsoner);
	app.use(function (error, req, res, next){
    	//Catch json error
    	console.log("Error encountered");
    	res.sendStatus(400);
    	next(error);
	});

	app.get("/info", jsoner, function(req, res) {
		res.setHeader('content-type', 'application/json');
		pgdb.info().then(function(info) {
			var data = JSON.stringify(info);
			res.send(data);
		});
 	}.bind(this));

	app.get("/compile", jsoner, function(req, res) {
		if(!req.body || !req.body.platform || !req.body.version) {
			console.log("Invalid body, platform, or version");
			return res.sendStatus(400);
		}

		var id = "php_test";
		var project = {
			id:id, //Need to get random unique id
			language:req.body.platform,
			version:req.body.version,
			documents: {
				index: {
					ext:"php",
					content:req.body.code
				}
			}
		};

		var zmqReq = zmq.socket('zmq');
		zmqReq.connect(workURL);
		zmqReq.on("message", function(data) {
			var response = JSON.parse(data);

			res.send({ status:200, id:id, stdout:response.stdout, stderr:response.stderr });
			console.log("Reponse " + count + ":", response.stdout);
			send();
		});

		var data = JSON.stringify(project);
		zeroReq.send(data);
	});

	app.get("/script/:id", jsoner, function(req, res) {
 		var scripter = new ScriptManager(config.urls.mongo);
 		scripter.getScript(req.params.id).then(function(doc) {
 			res.send(doc || {});
 		}).catch(function(error) {
 			keeper.record("getScript", error, true);
 			res.send({ status:500, message:"We were unable to complete your request, please try again later"});
 		});
 	});
};

module.exports = RestAPI;
