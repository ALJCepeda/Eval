var shell = require("child_process");
var path = require("path");
var fs = require("fs");
var Promise = require("promise");
var _ = require("underscore");
var Generator = require("./generator");

var DockerFork = function() {
	this.cmd = "sudo docker run";
	this.killCMD = "sudo docker kill";
	
	this.tmpDir = "/var/tmp/eval";
	this.guestRoot = "/scripts";

	this.name = "";
	this.tmp = "";
	this.descriptor = "";

	this.timeout = 10000;
};


DockerFork.prototype.start = function(name, tmp, descriptor, timeout) {
	//Check if script needs to be compiled first
	var self = this;
	this.name = name;
	this.tmp = tmp;
	this.descriptor = descriptor;

	if( descriptor.needsCompile() ) {
		return self.compile(descriptor, timeout).then(function(data) {
			//Check if compiled file has been created
			var compiledName = descriptor.compiledName(tmp.filename);
			var compiledFile = path.join(tmp.dirname, compiledName);

			return self.compiled(compiledFile).then(function(compiled) {
				if(compiled === false) {
					//Failed to compile, send output
					return Promise.resolve(data);
				} 

				return self.exec(descriptor, timeout);
			});
		});
	} else {
		return self.exec(descriptor, timeout);
	}
};

DockerFork.prototype.compiled = function(path) {
	return new Promise(function(resolve, reject) {
		fs.stat(path, function(err, stat) {
			if(err) { reject(err); }
			else if(!stat) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
};

DockerFork.prototype.kill = function() {
	var generator = new Generator(this.tmpDir, this.guestRoot);
	var command = generator.kill(this.name);

	return this.fork(command);
};

DockerFork.prototype.exists = function() {
	var generator = new Generator(this.tmpDir, this.guestRoot);
	var command = generator.exists(this.name);

	return this.fork(command).then(function(data) {
		if(data.stdout !== "") {
			return Promise.resolve(true);
		} else {
			return Promise.resolve(false);
		}
	});
};

DockerFork.prototype.compile = function(timeout) {
	var generator = new Generator(this.tmpDir, this.guestRoot);
	var command = generator.docker(this.name, this.version, this.descriptor);
	command += " " + generator.compile(this.tmp.filename, this.descriptor);

	return this.fork(command, timeout);
};

DockerFork.prototype.execute = function(timeout) {
	var generator = new Generator(this.tmpDir, this.guestRoot);
	var command = generator.docker(this.name, this.version, this.descriptor);
	command += " " + generator.execute(this.tmp.filename, this.descriptor);

	return this.fork(command, timeout);
};

DockerFork.prototype.fork = function(command, timeout, delay) {
	//Execute docker command
	var promise = new Promise(function(resolve, reject) {
		shell.exec(command, function(error, stdout, stderr) {
			if(error && error.kill === true) {
				reject({ error:error, stderr:stderr, command:command });
			} else {
				resolve({ stdout:stdout, stderr:stderr, command:command });
			}
		});
	});

	return promise;
};

module.exports = DockerFork;