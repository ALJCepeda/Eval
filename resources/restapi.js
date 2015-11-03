var bodyparser = require("body-parser");
var fs = require("fs");
var tmp = require("tmp");
var path = require("path");
var uid = require("uid");

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

		if(script === '') {
			return res.send({ status:400, message:'Must contain a valid script' });
		}

		if(!docker_descriptions[platform]) {
			return res.send({ status:400, message:'Unrecognized language: ' + platform });
		}

		if(!docker_descriptions[platform].hasVersion(version)) {
			return res.send({ status:400, message:'Unrecognized version: ' + version });
		}

		var docker = new Dockerizer();
		var descriptor = docker_descriptions[platform];

		var tmpdir = tmp.dirSync({ mode:0744, template:path.join("/var/tmp/eval", platform, "XXXXXXX"), unsafeCleanup:true});
		var tmpfile = tmp.fileSync({ mode:0744, postfix:descriptor.ext, dir:tmpdir.name });

		var filename = path.basename(tmpfile.name);
		var dockername = path.basename(tmpdir.name);

		fs.writeSync(tmpfile.fd, script);
		docker.configure(descriptor, dockername, version);

		docker.start(filename, function(error, stdout, stderr) {
			if( error  && error.kill === true) {
				res.sendStatus(500);
				console.log("Docker error: " + stderr);
			} else {
				var scriptReg = new RegExp('/scripts/'+filename, 'g');
				var output = stdout.replace(scriptReg, 'Script.js');
				var error = stderr.replace(scriptReg, 'Script.js');

				res.send({ statuse:200, stdout:output, stderr:error });
			}

			tmpfile.removeCallback();
			tmpdir.removeCallback();
		});
	});

	app.get("/script/:id", jsoner, function(req, res, next) {
 		console.log("Scriptid: " + req.params.id);
 		res.send({
 			platform:'nodejs',
 			version:'latest',
 			script:'console.log("Huzzah!");'
 		});
 	});
};

module.exports = Restful;