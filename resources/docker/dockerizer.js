var path = require("path");
var fs = require("fs");

var Temper = require("./temper");
var Generator = require("./generator");
var Fork = require("./fork");
var Promise = require("promise");

var Dockerizer = function() {
	this.name = "";
	this.tmp = "";
	this.descriptor = "";
};

Dockerizer.prototype.execute = function(code, descriptor, timeout) {
	var temper = new Temper(this.tmpDir);
	var info = temper.createCode(code, descriptor.ext, descriptor.repository);
	
	this.tmp = info;
	this.name = info.dirname;
	this.descriptor = descriptor;

	var fork = new DockerFork(name, descriptor.version, descriptor, info);
	var promise;
	if( descriptor.needsCompile() ) {
		promise = fork.compile(timeout).then(function(data) {
			if(data.status === 'failed') {
				return Promise.resolve(data);
			}

			return fork.execute(timeout);
		});
	} else {
		promise = fork.execute(timeout);
	}

	return promise.finally(function() {
		temper.cleanup();
	});
};

Dockerizer.prototype.prettify = function(str, descriptor) {
	var result = str;
	descriptor.removals.forEach(function(removal) {
		var rem = new RegExp(removal, "g");
		result = result.replace(rem, "");
	});

	var linebreak = new RegExp("\n", "g");
	var tab = new RegExp("\t", "g");

	result = result.replace(linebreak, "</br>").replace(tab, "&nbsp&nbsp&nbsp&nbsp");
	return result;
};

Dockerizer.prototype.compiled = function(path) {
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

module.exports = Dockerizer;