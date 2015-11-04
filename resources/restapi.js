var RestAPI = function(book) {
	var bodyparser = require("body-parser");
	var ScriptManager = require("./scriptmanager.js");
	var Dockerizer = require("./docker/dockerizer.js");
	var docker_descriptions = require("./docker/descriptors");
	var config = require("../config.js");

	var self = this;
	this.jsoner = bodyparser.json();
	//this.keeper = book.keeper('restapi');
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

			var platform = req.body.platform;
			var version = req.body.version;
			var script = req.body.script;

			if(script === "") {
				return res.send({ status:400, message:"Must contain a valid script" });
			}

			if(!docker_descriptions[platform]) {
				return res.send({ status:400, message:"Unrecognized language: " + platform });
			}

			if(!docker_descriptions[platform].hasVersion(version)) {
				return res.send({ status:400, message:"Unrecognized version: " + version });
			}

			var scripter = new ScriptManager(config.urls.mongo);
			scripter.saveScript(platform, version, script).then(function(buf) {
				console.log("saveScript saved: " + buf.id);

				var docker = new Dockerizer();
				docker.doCompilation(platform, version, script).then(function(data) {
					//book.record("restapi", "doCompilation", data.command);

					var scriptReg = new RegExp("/scripts/"+data.filename, "g");
					var out = data.stdout.replace(scriptReg, "Script.js");
					var err = data.stderr.replace(scriptReg, "Script.js");

					res.send({ status:200, id:buf.id, stdout:out, stderr:err });
				}).catch(function(data) {
					res.sendStatus(500);
					//book.record("restapi", )
					console.log("doCompilation error: " + data);
				});
			}).catch(function(buf) {
				console.log("saveScript error: " + buf);
				res.send({ status:500, message:"We were unable to save the script, please try again later" });
			});		
		});	
	};

	this.routes.scriptID = function(app, method) {
		app[method]("/script/:id", self.jsoner, function(req, res) {
	 		console.log("Scriptid: " + req.params.id);

	 		var scripter = new ScriptManager(config.urls.mongo);
	 		scripter.getScript(req.params.id).then(function(buf) {
	 			res.send(buf.doc);
	 		}).catch(function(buf) {
	 			res.send(buf.err);
	 		});
	 	});
	};
};

module.exports = RestAPI;