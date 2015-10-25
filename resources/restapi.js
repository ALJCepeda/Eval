var Restful = function(app) {
	var bodyparser = require("body-parser");
	var fs = require("fs");
	var tmp = require("tmp");
	var path = require("path");
	var uid = require("uid");
	
	var Dockerizer = require("./dockerizer.js");
	var config = require('../config.js');

	var jsoner = bodyparser.json();
	app.use(jsoner);
	app.use(function (error, req, res, next){
    	//Catch json error
    	console.log("Error encountered");
    	res.sendStatus(400);
    	next(error);
	});
 	
 	app.get("/supported", jsoner, function(req, res) {
 		res.send(config.supported);
 	});

 	app.get("/themes", jsoner, function(req, res) {
 		res.send(config.aceThemes);
 	});

	app.post("/compile", jsoner, function(req, res) {
		if(!req.body || !req.body.type || !req.body.version || !req.body.script) {
			return res.sendStatus(400);
		}

		console.log("Valid compile request received");
		var script = req.body.script;

		var tmpFile = tmp.fileSync({ mode: 0644, postfix:".php", dir:"/var/tmp/eval/php" });
		fs.writeSync(tmpFile.fd, script);

		console.log("Creating docker command");
		var filename = path.basename(tmpFile.name);
		console.log(tmpFile.name);
		var dockername = uid(10);

		var docker = new Dockerizer();
		docker.name = dockername;
		docker.domain = 'literphor';
		docker.repository = 'php';
		docker.version = '5.6';
		docker.cmd = 'php';
		docker.args = [ '/script/' + filename ];
		docker.mounted = [ {
			host:'/var/tmp/eval/php',
			guest:'/script'
		}, {
			host:'/var/www/node/eval/resources/configs/php.ini',
			guest:'/usr/local/etc/php/php.ini'
		}];

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