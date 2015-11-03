var bodyparser = require("body-parser");
var fs = require("fs");
var tmp = require("tmp");
var path = require("path");
var uid = require("uid");
var config = require('../config.js');
var MongoClient = require('mongodb').MongoClient;
var Promise = require('promise');

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

 	var uid_tries = 0;
 	function getUID(max) {
 		var id = uid(8);
 		uid_tries++;

 		return new Promise(function(resolve, reject) {
 			MongoClient.connect(config.mongoURL, function(err, db) {
 				var cursor = db.collection('scripts').find({ id:id });
 				cursor.each(function(err, doc) {
 					if(err != null) {
 						uid_tries = 0;
 						reject(err);
 					} else if(doc != null) {
 						if(uid_tries >= max) {
 							uid_tries = 0;
 							reject(err, doc);
 						} else {
 							getUID(max).then(resolve, reject);
 						}
 					} else {
 						uid_tries = 0;
 						resolve(id);
 					}
 				});
 			});
 		});
 	};

 	function saveScript(platform, version, script) {
 		return new Promise(function(resolve, reject) {
	 		getUID().then(function(id) {
	 			MongoClient.connect(config.mongoURL, function(err, db) {
		 			var now = Date.now();
		 			db.collection('scripts').insertOne({
		 				id:id,
		 				platform:platform,
		 				version:version,
		 				script:script,
		 				created:now
		 			}, function(err, result) {
		 				if(err) {
		 					reject(err);
		 				} else {
		 					resolve(id, result);
		 				}
		 				db.close();
	 				});
				});
	 		}).catch(function(err){
				console.log("getUID: " + err);
			});
 		});
 		
 	}

 	function getScript(id) {
 		return new Promise(function(resolve, reject) {
	 		MongoClient.connect(config.mongoURL, function(err, db) {
	 			var cursor = db.collection('scripts').find({ id:id });
	 			cursor.each(function(err, doc) {
	 				if(err) {
	 					reject(err);
	 				} else {
	 					resolve(doc);
	 				}
	 				db.close();
	 			});
	 		});
	 	});
 	}

 	function doCompilation(platform, version, script, complete) {
 		var docker = new Dockerizer();
		var descriptor = docker_descriptions[platform];

		var tmpdir = tmp.dirSync({ mode:0744, template:path.join("/var/tmp/eval", platform, "XXXXXXX"), unsafeCleanup:true});
		var tmpfile = tmp.fileSync({ mode:0744, postfix:descriptor.ext, dir:tmpdir.name });

		var filename = path.basename(tmpfile.name);
		var dockername = path.basename(tmpdir.name);

 		fs.writeSync(tmpfile.fd, script);
		docker.configure(descriptor, dockername, version);

		docker.start(filename, function(error, stdout, stderr) {
			complete(error, stdout, stderr, filename)

			tmpfile.removeCallback();
			tmpdir.removeCallback();
		});
 	}

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

		saveScript(platform, version, script).then(function(id) {
			console.log("Saved script " + id);
			doCompilation(platform, version, script, 
				function(error, stdout, stderr, filename) {
					if( error  && error.kill === true) {
						res.sendStatus(500);
						console.log("Docker error: " + stderr);
					} else {
						var scriptReg = new RegExp('/scripts/'+filename, 'g');
						var output = stdout.replace(scriptReg, 'Script.js');
						var error = stderr.replace(scriptReg, 'Script.js');

						res.send({ status:200, id:id, stdout:output, stderr:error });
					}
			});
		}).catch(function(err) {
			console.log("saveScript: " + err);
			res.send({ status:500, message:'We were unable to save the script, please try again later' });
		});		
	});

	app.get("/script/:id", jsoner, function(req, res, next) {
 		console.log("Scriptid: " + req.params.id);

 		getScript(req.params.id).then(function(doc) {
 			res.send(doc);
 		}).catch(function(err) {
 			res.send(err);
 		});
 	});
};

module.exports = Restful;