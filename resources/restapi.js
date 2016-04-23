var RestAPI = function(book) {
	var bodyparser = require("body-parser");
	var ScriptManager = require("./scriptmanager.js");
	var Dockerizer = require("../libs/dockerizer/dockerizer.js");
	var docker_descriptions = require("./descriptors");
	var config = require("../config.js");
	var keeper = book.keeper("RestAPI");

	var self = this;
	this.jsoner = bodyparser.json();
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
			
			var platform = req.body.platform;
			var version = req.body.version;
			var code = req.body.code;
			var last = req.body.last || "";
			var docker = new Dockerizer(config.dirs.temp, docker_descriptions);

			if(code === "") {
				return res.send({ status:400, message:"Must contain valid code" });
			}

			if(!docker.canExecute(platform, version)) {
				return res.send({ status:400, message:"Unrecognized platform or version" });
			}

			var scripter = new ScriptManager(config.urls.mongo);
			scripter.saveScript(platform, version, code, last).then(function(id) {
				keeper.record("saveScript", id, true);

				var error = "";
				docker.stopAfter = 5000;
				docker.execute(code, platform, version, function(result) {
					//Called when container exceeds timeout
					error = "<p style='color:red'>\n\nScript exceeded the timeout of " + docker.stopAfter + "ms and was murdered in cold blood</p>";
				}).then(function(result) {
					//Successful execution of script
					keeper.record("execute", result.command);
					var filename = result.filename;
					var name = filename.substring(0, filename.indexOf('.'));

					var scriptReg = new RegExp(name, "g");
					var out = result.stdout.replace(scriptReg, "index");
					var err = result.stderr.replace(scriptReg, "index");

					res.send({ status:200, id:id, stdout:out, stderr:err + error });
				}).catch(function(error) {
					keeper.record("execute", error, true);
					res.sendStatus({ status:500, message:"We were unable to complete your request, please try again later" });
				});
			}).catch(function(error) {
				keeper.record("saveScript", error, true);
				res.send({ status:500, message:"We were unable to complete your request, please try again later" });
			});
		});	
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