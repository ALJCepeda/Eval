var bodyparser = require("body-parser");
var config = require("../config.js");


require("./prototypes/object.js");

var ScriptManager = require("./scriptmanager.js");
var Dockerizer = require("./docker/dockerizer.js");
var docker_descriptions = require("./docker/descriptors");
var config = require("../config.js");

var Restful = function(app) {
	var jsoner = bodyparser.json();
	app.use(jsoner);
	app.use(function (error, req, res, next){
    	//Catch json error
    	console.log("Error encountered");
    	res.sendStatus(400);
    	next(error);
	});
 	
 	app.all("/:action", jsoner, function(req, res, next) {
 		console.log("Action: " + req.params.action);
 		next();
 	});

 	app.get("/info", jsoner, function(req, res) {
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

	app.post("/compile", jsoner, function(req, res) {
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

		var scripter = new ScriptManager(config.mongoURL);
		scripter.saveScript(platform, version, script).then(function(id) {
			console.log("Saved script " + id);

			var docker = new Dockerizer();
			docker.doCompilation(platform, version, script).then(function(stdout, stderr, filename) {
				var scriptReg = new RegExp("/scripts/"+filename, "g");
				var out = stdout || "";
				var err = stderr || "";

				out = out.replace(scriptReg, "Script.js");
				err = err.replace(scriptReg, "Script.js");

				res.send({ status:200, id:id, stdout:out, stderr:err });
			}).catch(function(error, stderr) {
				res.sendStatus(500);
				console.log("Docker error: " + error);
			});
		}).catch(function(err) {
			console.log("saveScript: " + err);
			res.send({ status:500, message:"We were unable to save the script, please try again later" });
		});		
	});

	app.get("/script/:id", jsoner, function(req, res) {
 		console.log("Scriptid: " + req.params.id);

 		var scripter = new ScriptManager(config.mongoURL);
 		scripter.getScript(req.params.id).then(function(doc) {
 			res.send(doc);
 		}).catch(function(err) {
 			res.send(err);
 		});
 	});
};

module.exports = Restful;