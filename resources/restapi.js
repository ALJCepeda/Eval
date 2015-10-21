var Restful = function(app) {
	var bodyparser = require("body-parser");
	var shell = require("child_process");
	var fs = require("fs");
	var tmp = require("tmp");
	var path = require("path");

	var jsoner = bodyparser.json();
	app.use(jsoner);
	app.use(function (error, req, res, next){
    	//Catch json error
    	console.log("JSON error");
    	res.sendStatus(400);
	});

	app.post("/compile", jsoner, function(req, res) {
		if(!req.body || !req.body.type || !req.body.script) {
			return res.sendStatus(400);
		}

		console.log("Valid compile request received");
		var script = req.body.script;

		var tmpFile = tmp.fileSync({ mode: 0644, postfix:"php", dir:"/var/tmp/eval/php" });
		fs.writeSync(tmpFile.fd, script);

		console.log("Creating docker command");
		var name = path.basename(tmpFile.name);
		var cmd = "sudo docker run --rm";
		cmd += " --name "+name; 
		cmd += " -v /var/tmp/eval/php:/script";
		cmd += " -v /var/www/node/eval/resources/configs/php.ini:/usr/local/etc/php/php.ini";
		cmd += " php:5.6-cli php /script/" + name;

		console.log("Executing docker command");
		shell.exec(cmd, function(error, stdout, stderr) {
			console.log("Docker finished, sending result");
			if(error) {
				if(error.kill === true) {
					//Docker Error
					console.log("Docker: " + stderr);
					res.sendStatus(500);
				} else {
					//Command Error, probably pre-compile errors
					var result = stderr.replace("/script/" + name, "POOP!");
					res.send(result);
				}
			} else {
				//Command output
				res.send(stdout);
			}
		});
	});
};

module.exports = Restful;