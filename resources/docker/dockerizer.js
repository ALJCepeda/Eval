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

	this.running = "";
	this.tmpDir = "/var/tmp/eval";
	this.guestRoot = "/scripts";
};

Dockerizer.prototype.start = function(timeout) {
	//Check if script needs to be compiled first
	var file = this.tmp.file;
	var descriptor = this.descriptor; 

	if( this.descriptor.needsCompile() ) {
		return this.compile(descriptor, timeout).then(function(data) {
			//Check if compiled file has been created
			var compiledName = descriptor.compiledName(file);
			var compiledFile = path.join(this.tmp.dirname, compiledName);

			return this.compiled(compiledFile).then(function(compiled) {
				if(compiled === false) {
					//Failed to compile, send output
					return Promise.resolve(data);
				} 

				return this.exec(descriptor, timeout);
			}.bind(this));
		}.bind(this));
	} else {
		return this.exec(descriptor, timeout);
	}
};	

Dockerizer.prototype.execute = function(code, version, descriptor, timeout) {
	var temper = new Temper(this.tmpDir);
	var info = temper.createCode(code, descriptor.ext, descriptor.repository);
	
	this.tmp = info;
	this.name = info.dirname;
	this.version = version;
	this.descriptor = descriptor;

	return this.start(timeout).then(function(data) {
		data.filename = info.filename;

		data.stderr = this.prettify(data.stderr, descriptor);

		return Promise.resolve(data);
	}.bind(this)).finally(function() {
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

Dockerizer.prototype.exists = function() {
	var generator = new Generator(this.tmpDir, this.guestRoot);
	var command = generator.exists(this.name);

	var fork = new Fork();
	return fork.fork(command).then(function(data) {
		if(data.stdout !== "") {
			return Promise.resolve(true);
		} else {
			return Promise.resolve(false);
		}
	});
};

Dockerizer.prototype.kill = function() {
	var generator = new Generator(this.tmpDir, this.guestRoot);
	var command = generator.kill(this.name);

	var fork = new Fork();
	return fork.fork(command);
};

Dockerizer.prototype.compile = function(timeout) {
	var generator = new Generator(this.tmpDir, this.guestRoot);
	var command = generator.docker(this.name, this.version, this.descriptor);
	command += " " + generator.compile(this.tmp.filename, this.descriptor);

	var fork = new Fork();
	return fork.fork(command, timeout);
};

Dockerizer.prototype.exec = function(timeout) {
	var generator = new Generator(this.tmpDir, this.guestRoot);
	var command = generator.docker(this.name, this.version, this.descriptor);
	command += " " + generator.command(this.tmp.filename, this.descriptor);

	var fork = new Fork();
	return fork.fork(command, timeout);
};

module.exports = Dockerizer;