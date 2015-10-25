var shell = require("child_process");
var uid = require("uid");

var Dockerizer = function() {
	var self = this;
	this.shouldRemove = true;
	this.domain = 'literphor';
	this.mounts = [ ];
	this.name = uid(10);;
	this.repository = '';
	this.version = '';
	this.command = '';
	this.args =  [ ];

	this.configure = function(version, descriptor) {
		self.version = version;
		self.cmd = descriptor.command;
		self.repository = descriptor.repository || descriptor.name;
		self.domain = descriptor.domain || self.domain;
		self.mounts = descriptor.mounts || self.mounts;
	};

	this.generateCommand = function() {
		var cmd = "sudo docker run";
		cmd += (self.shouldRemove) ? ' --rm' : '';

		cmd += self.mounts.reduce(function(pre, mount) {
			return pre + ' -v ' + mount.host + ':' + mount.guest; 
		}, '');

		cmd += ' ' + self.repository + ':' + self.version + ' ' + self.cmd;

		cmd += self.args.reduce(function(pre, arg) {
			return pre + ' ' + arg;
		}, '');

		return cmd;
	};

	this.run = function(success, failure) {
		var command = self.generateCommand();

		console.log("Executing docker command");
		shell.exec(command, function(error, stdout, stderr) {
			console.log("Docker finished, sending result");
			if(error) {
				console.log("Docker: " + stderr);
				failure(error, stderr);
			} else {
				success(stdout);
			}
		});
	};
};

module.exports = Dockerizer;