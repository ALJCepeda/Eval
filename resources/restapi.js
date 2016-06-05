var RestAPI = function(workurl, book) {
	var bodyparser = require("body-parser");
	var ScriptManager = require("./scriptmanager.js");
	var descriptors = require("./descriptors");
	var config = require("../config.js");
	var keeper = book.keeper("RestAPI");
	var self = this;

	var zmq = require("zmq");
	var req = zmq.socket("req");
	req.identity = "client" + process.pid;

	this.jsoner = bodyparser.json();
	this.workurl = workurl;
	//this.keeper = book.keeper("restapi");
	this.routes = {};

	this.bootstrap = function(app) {
		app.use(self.jsoner);
		app.use(function (error, req, res, next){
	    	//Catch json error
	    	console.log("Error encountered");
	    	res.sendStatus(400);
	    	next(error);
		});
	};

	this.routes.info = function(app, method) {
		app[method]("/info", self.jsoner, function(req, res) {
	 		var supported = { };
	 		var precodes = { };
	 		var themes = config.aceThemes;

	 		Object.each(docker_descriptions, function(name, descriptor) {
	 			supported[name] = descriptor.versions;
	 			precodes[name] = descriptor.precode;
	 		});

	 		res.send({
	 			supported:supported,
	 			precodes:precodes,
	 			themes:themes
	 		});
	 	});
	};

	this.routes.compile = function(app, method) {
		app[method]("/compile", self.jsoner, function(req, res) {
			if(!req.body || !req.body.platform || !req.body.version) {
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

			req.bind(this.workurl, function(err) {
				if(err) throw err;

				req.on("message", function(data) {
					var response = JSON.parse(data);

					res.send({ status:200, id:id, stdout:response.stdout, stderr:response.stderr });
					console.log("Reponse " + count + ":", response.stdout);
					send();
				});

				var data = JSON.stringify(project);
				req.send(data);
			});
		}.bind(this));
	};

	this.routes.scriptID = function(app, method) {
		app[method]("/script/:id", self.jsoner, function(req, res) {
	 		var scripter = new ScriptManager(config.urls.mongo);
	 		scripter.getScript(req.params.id).then(function(doc) {
	 			res.send(doc || {});
	 		}).catch(function(error) {
	 			keeper.record("getScript", error, true);
	 			res.send({ status:500, message:"We were unable to complete your request, please try again later"});
	 		});
	 	});
	};
};

module.exports = RestAPI;
