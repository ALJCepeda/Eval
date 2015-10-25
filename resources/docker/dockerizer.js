var shell = require("child_process");
var uid = require("uid");

var Dockerizer = function() {
	var self = this;
	this.shouldRemove = true;
	this.domain = 'literphor';
	this.name = '';
	this.mounts = [ ];
	this.type = '';
	this.repository = '';
	this.version = '';
	this.command = '';
	this.args =  [ ];

	this.configure = function(descriptor, name, version, type) {
		self.version = version;
		self.cmd = descriptor.command;
		self.name = name;
		self.type = type || descriptor.name;
		self.repository = descriptor.repository || descriptor.name;
		self.domain = descriptor.domain || self.domain;
		self.mounts = descriptor.mounts || self.mounts;
	};

	//Generates docker command based on object's configuration
	//Dockername is the semantic name for the process running our container
	//Also determines the folder containing the user's script file
	this.generateCommand = function() {
		//Base docker command
		var cmd = "sudo docker run";

		//Will automatically remove docker container when exits
		cmd += (self.shouldRemove) ? ' --rm' : '';

		cmd += ' --name ' + self.name;

		//Add all mounts to the command in the form -v host:guest
		cmd += self.mounts.reduce(function(pre, mount) {
			return pre + ' -v ' + mount.host + ':' + mount.guest; 
		}, '');

		//Mounts folder containing user's script to /script in guest
		cmd += ' -v ' + '/var/tmp/eval/' + self.type + ':/script';

		//Add information about the container and command we want to run
		cmd += ' ' + self.domain + '/' + self.repository + ':' + self.version + ' ' + self.cmd;

		//Adds arguments for command
		cmd += self.args.reduce(function(pre, arg) {
			return pre + ' ' + arg;
		}, '');

		return cmd;
	};

	this.run = function(success, failure) {
		var command = self.generateCommand();

		shell.exec(command, function(error, stdout, stderr) {
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