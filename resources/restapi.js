var bodyparser = require("body-parser");
var fs = require("fs");
var tmp = require("tmp");
var path = require("path");

require("./prototypes/object.js");

var Dockerizer = require("./docker/dockerizer.js");
var docker_descriptions = require("./docker/descriptors");
var config = require('../config.js');

var Restful = function(app) {
	var jsoner = bodyparser.json();
	app.use(jsoner);
	app.use(function (error, req, res, next){
    	//Catch json error
    	console.log("Error encountered");
    	res.sendStatus(400);
    	next(error);
	});
 	
 	app.get("/supported", jsoner, function(req, res) {
 		var supported = docker_descriptions.map(function(name, descriptor) {
 			var result = {};
 			result[name] = descriptor.versions;
 			return result;
 		});

 		res.send(supported);
 	});

 	app.get("/themes", jsoner, function(req, res) {
 		res.send(config.aceThemes);
 	});

	app.post("/compile", jsoner, function(req, res) {
		if(!req.body || !req.body.type || !req.body.version || !req.body.script) {
			return res.sendStatus(400);
		}

		var type = req.body.type;
		var version = req.body.version;
		var script = req.body.script;

		if(!docker_descriptions[type]) {
			return res.send('Unrecognized language: ' + type);
		}

		if(!docker_descriptions[type].hasVersion(version)) {
			return res.send('Unrecognized version: ' + version + ' for type: ' + type);
		}

		console.log("Valid compile request received");
		var tmpFile = tmp.fileSync({ mode: 0644, postfix:".php", dir:"/var/tmp/eval/php" });
		fs.writeSync(tmpFile.fd, script);

		console.log("Creating docker command");
		var filename = path.basename(tmpFile.name);
		var dockername = uid(10);

		var descriptor = docker_descriptions[type];
		var docker = new Dockerizer();
		docker.configure(descriptor, version, dockername);

		console.log(docker.generateCommand());
		/*
		docker.run(function(stdout) {
			res.send(stdout);
		}, function(error, stderr) {
			if(error.kill === true) {
				res.sendStatus(500);
			} else {
				var result = stderr.replace("/script/" + filename, "POOP!");
				res.send(result);
			}
		});*/
	});
};

module.exports = Restful;