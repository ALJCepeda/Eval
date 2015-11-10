var shell = require("child_process");
var path = require("path");
var fs = require("fs");
var Promise = require("promise");
var _ = require("underscore");
var Generator = require("./generator");

var DockerFork = function(name, descriptor, tmp) {
	this.cmd = "sudo docker run";
	this.killCMD = "sudo docker kill";
	
	this.guestRoot = "/scripts";

	this.name = name;
	this.tmp = tmp;
	this.descriptor = descriptor;

	this.timeout = 10000;
};

DockerFork.prototype.compiled = function(path) {
	return new Promise(function(resolve, reject) {
		fs.stat(path, function(err, stat) {
			if(err) { reject(err); }
			else if(!stat) {
				return resolve(false);
			} else {
				return resolve(true);
			}
		});
	});
};

DockerFork.prototype.command = function(action) {
	var generator = new Generator();
	generator.mounts.push({
		host:this.tmp.dir.name,
		guest:this.guestRoot
	});
	generator.mounts.concat(this.descriptor.mounts);
	generator.workDir = this.guestRoot;

	var command = generator.docker(this.name, this.descriptor.version, this.descriptor.repository);
	command += " " + generator.create(this.tmp.filename, this.descriptor, action);
	return command;
};

DockerFork.prototype.kill = function() {
	var generator = new Generator(this.tmp.dir.name, this.guestRoot);
	var command = generator.kill(this.name);

	return this.fork(command);
};

DockerFork.prototype.exists = function() {
	var generator = new Generator(this.tmp.dir.name, this.guestRoot);
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
	var command = this.command("compile");

	return this.fork(command, timeout).then(function(data) {
		var filename = descriptor.compiledName(this.tmp.filename);
		return this.compiled(filename);
	}.bind(this));
};

DockerFork.prototype.execute = function(timeout) {
	var command = this.command("command");

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