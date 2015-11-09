var Generator = function(tmpDir, guestRoot) {      
	var self = this;
	this.shouldRemove = true;
	this.mounts = [];
	this.domain = "literphor";

	this.runCMD = "sudo docker run";
	this.killCMD = "sudo docker kill";
	this.existsCMD = "sudo docker ps | grep";

	this.tmpDir = tmpDir;
	this.guestRoot = guestRoot;
};

var path = require("path");
var _ = require("underscore");

//Generates docker command based on object"s configuration
//Dockername is the semantic name for the process running our container
//Also determines the folder containing the user"s script file
Generator.prototype.docker = function(name, version, descriptor) {
	//Base docker command
	var parts = [];
	var hostRoot = path.join(this.tmpDir, descriptor.repository, name);
	var image = path.join(this.domain, descriptor.repository) + ":" + version;

	var mounts = this.mounts.concat(descriptor.mounts).reduce(function(pre, mount) {
		return pre + " -v " + mount.host + ":" + mount.guest; 
	}, "");

	parts.push(this.runCMD);

	if(this.shouldRemove === true) {
		parts.push(" --rm");
	}

	parts.push(" --name " + name);
	parts.push(" -w " + this.guestRoot);
	parts.push(" -v " + hostRoot + ":" + this.guestRoot);
	parts.push(mounts);
	parts.push(image);

	return parts.join(" ");
};

Generator.prototype.kill = function(name) {
	return this.killCMD + " " + name;
};

Generator.prototype.exists = function(name) {
	return this.existsCMD + " " + "'" + name + "'";
};

Generator.prototype.command = function(file, descriptor) {
	if( _.isFunction(descriptor.command) ) {
	 	return descriptor.command(file, uid);
	} else {
		return descriptor.command + file;
	}
};

Generator.prototype.compile = function(file, descriptor) {
	if( _.isFunction(descriptor.compile) ) {
		return descriptor.compile(file, uid);
	} else {
		return descriptor.compile + file;
	}
};

module.exports = Generator;