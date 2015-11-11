var path = require("path");
var fs = require("fs");
var _ = require("underscore");

var Temper = require("./temper");
var Generator = require("./generator");
var DockerFork = require("./fork");
var descriptors = require('./descriptors');

var Promise = require("promise");

var Dockerizer = function(root) {
	this.name = "";
	this.tmp = null;
	this.root = root;
	this.descriptor = null;
	this.fork = null;
};

Dockerizer.prototype.execute = function(code, version, platform, timeout) {
	var temper = new Temper(this.root);
	var descriptor = descriptors[platform];
	descriptor.version = version;

	var info = temper.createCode(code, descriptor.ext, platform);

	this.tmp = info;
	this.name = info.dirname;
	this.descriptor = descriptor;

	var promise;
	var fork = new DockerFork(this.name, descriptor, info);
	this.fork = fork;

	if( descriptor.needsCompile() ) {
		promise = fork.compile(timeout).then(function(data) {
			return this.compiled(data.compiledname).then(function(exists) {
				if(exists === true) {
					return fork.execute();
				} else {
					return Promise.resolve(data);
				}
			});
		}.bind(this));
	} else {
		promise = fork.execute();
	}

	if( _.isFunction(timeout)) {
		if(this.stopAfter > 0) {
			setTimeout(function() {
				if(this.fork.process() !== null) {
					this.fork.stop().then(function(result) {
						timeout(result);
					});
				}
			}.bind(this), this.stopAfter);
		}

		if(this.killAfter > 0) {
			setTimeout(function() {
				if(this.fork.process() !== null) {
					this.fork.kill().then(function(result) {
						timeout(result);
					});
				}
			}.bind(this), this.killAfter);
		}
	}

	return promise.finally(function() {
		temper.cleanup
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