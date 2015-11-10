var Generator = function() {      
	var self = this;
	this.shouldRemove = true;
	this.mounts = [];
	this.domain = "literphor";

	this.runCMD = "sudo docker run";
	this.killCMD = "sudo docker kill";
	this.existsCMD = "sudo docker ps | grep";

	this.workDir = "";
};

var path = require("path");
var _ = require("underscore");

//Generates docker command based on object"s configuration
//Dockername is the semantic name for the process running our container
//Also determines the folder containing the user"s script file
Generator.prototype.docker = function(name, version, repository) {
	//Base docker command
	var parts = [];
	var image = path.join(this.domain, repository) + ":" + version;

	var mounts = this.mounts.reduce(function(pre, mount) {
		return pre + " -v " + mount.host + ":" + mount.guest; 
	}, "");

	parts.push(this.runCMD);
	parts.push(" --name " + name);

	if(this.shouldRemove === true) {
		parts.push(" --rm");
	}

	if(this.workDir !== "") {
		parts.push(" -w " + this.workDir);
	}
	
	parts.push(mounts);
	parts.push(image);

	return parts.join(" ");
};

Generator.prototype.addMount = function(guest, host) {
	this.mounts.push({
		guest:guest,
		host:host
	});
}

Generator.prototype.kill = function(name) {
	return this.killCMD + " " + name;
};

Generator.prototype.exists = function(name) {
	return this.existsCMD + " " + "'" + name + "'";
};

Generator.prototype.create = function(filename, descriptor, action) {
	if( _.isFunction(descriptor[action]) ) {
		return descriptor[action](filename, uid);
	} else {
		return descriptor[action] + filename;
	}
};

module.exports = Generator;