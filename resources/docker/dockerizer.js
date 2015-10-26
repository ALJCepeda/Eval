var shell = require("child_process");
var uid = require("uid");
var path = require("path");

var Dockerizer = function() {
	var self = this;
	this.shouldRemove = true;

	this.name = '';
	this.domain = 'literphor';
	this.repository = '';
	this.version = '';
	this.image = '';

	this.hostRoot = '';
	this.guestRoot = '/scripts';
	this.mounts = [ ];
	
	this.command = '';
	this.args =  [ ];

	this.configure = function(descriptor, name, version) {
		self.name = name;
		self.version = version;
		
		self.cmd = descriptor.command;
		self.repository = descriptor.repository || descriptor.name;
		self.domain = descriptor.domain || self.domain;
		self.mounts = descriptor.mounts || self.mounts;

		self.hostRoot = path.join('/var/tmp/eval', self.repository, self.name);
		self.image = path.join(self.domain, self.repository) + ':' + self.version;
	}

	this.generate = {
		//Generates docker command based on object's configuration
		//Dockername is the semantic name for the process running our container
		//Also determines the folder containing the user's script file
		command: function() {
			//Base docker command
			var cmd = "sudo docker run";

			//Will automatically remove docker container when exits
			cmd += (self.shouldRemove) ? ' --rm' : '';

			cmd += ' --name ' + self.name;
			cmd += ' -w ' + self.guestRoot;

			//Mounts folder containing user's script to /script in guest
			cmd += ' -v ' + self.hostRoot + ':' + self.guestRoot;

			//Add all mounts to the command in the form -v host:guest
			cmd += self.mounts.reduce(function(pre, mount) {
				return pre + ' -v ' + mount.host + ':' + mount.guest; 
			}, '');


			//Add information about the container and command we want to run
			cmd += ' ' + self.image + ' ' + self.cmd;

			return cmd;
		},

		commandArgs: function() {
			return self.args.reduce(function(pre, arg) {
				return pre + ' ' + arg;
			}, '');
		}
	};
	

	this.run = function(file, success, failure) {
		//Gather docker command
		var command = self.generate.command();

		//Tell command which file to run in guest machine
		command += " " + file;

		//Add rest of command's arguments
		command += self.generate.commandArgs();

		console.log("Docker Command: " + command);
		//Execute docker command
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