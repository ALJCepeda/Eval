var shell = require("child_process");
var uid = require("uid");
var path = require("path");
var _ = require("underscore");

var Dockerizer = function() {
	var self = this;
	this.name = '';
	this.descriptor;
	this.shouldRemove = true;
	this.mounts = [];

	this.command = 'sudo docker run';
	this.domain = 'literphor';
	this.hostRoot = '';
	this.guestRoot = '/scripts';

	this.configure = function(descriptor, name, version) {
		self.name = name;
		self.version = version;
		self.descriptor = descriptor;

		self.hostRoot = path.join('/var/tmp/eval', descriptor.repository, self.name);
		self.image = path.join(self.domain, descriptor.repository) + ':' + self.version;
	}

	this.generate = {
		//Generates docker command based on object's configuration
		//Dockername is the semantic name for the process running our container
		//Also determines the folder containing the user's script file
		command: function() {
			//Base docker command
			var cmd = self.command;

			//Will automatically remove docker container when exits
			cmd += (self.shouldRemove) ? ' --rm' : '';

			cmd += ' --name ' + self.name;
			cmd += ' -w ' + self.guestRoot;

			//Mounts folder containing user's script to /script in guest
			cmd += ' -v ' + self.hostRoot + ':' + self.guestRoot;

			//Add all mounts to the command in the form -v host:guest
			var mounts = self.mounts.concat(self.descriptor.mounts);
			cmd += mounts.reduce(function(pre, mount) {
				return pre + ' -v ' + mount.host + ':' + mount.guest; 
			}, '');

			//Add information about the container and command we want to run
			cmd += ' ' + self.image;

			return cmd;
		}
	};
	
	this.start = function(file, complete) {
		//Check if script needs to be compiled first
		if( _.isFunction(self.descriptor.compile) ) {
			var command = self.generate.command();
			command += " " + self.descriptor.compile(file);

			self.exec(command, function(error, stdout, stderr) {
				if(error) { complete(error, stdout, stderr); }
				else { self.run(file, complete); }
			});
		} else {
			self.run(file, complete);
		}
	};

	this.run = function(file, complete) {
		var command = self.generate.command();
		if( _.isFunction(self.descriptor.command )) {
			command += " " + self.descriptor.command(file, uid);
		} else if( _.isString(self.descriptor.command )) {
			command += " " + self.descriptor.command + " " + file;
		} else {
			command += " " + self.descriptor.repository + " " + file;
		}

		self.exec(command, complete);
	}

	this.exec = function(command, complete) {
		console.log("Command: " + command);

		//Execute docker command
		shell.exec(command, complete);
	}
};

module.exports = Dockerizer;