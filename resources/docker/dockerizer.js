var Dockerizer = function(tmpDir, historian) {
	var uid = require("uid");
	var path = require("path");
	var _ = require("underscore");
	var fs = require("fs");
	var tmp = require("tmp");
	var path = require("path");
	//var docker_descriptions = require("./descriptors");
	var Generator = require("./generator.js");
	var Fork = require("./fork");
	var Promise = require("promise");

	var self = this;
	this.name = '';
	this.file = '';
	this.descriptor = '';

	this.running = '';
	this.tmpDir = "/var/tmp/eval";
	this.guestRoot = "/scripts";

	this.execute = function(code, version, descriptor, timeout) {
		var tmpdir = tmp.dirSync({ mode:0744, template:path.join(self.tmpDir, descriptor.repository, "XXXXXXX"), unsafeCleanup:true});
		var tmpfile = tmp.fileSync({ mode:0744, postfix:descriptor.ext, dir:tmpdir.name });
		
		this.file = path.basename(tmpfile.name);
		this.name = path.basename(tmpdir.name);
		this.version = version;
		this.descriptor = descriptor;

 		fs.writeSync(tmpfile.fd, code);

		return this.start(timeout).then(function(data) {
			tmpfile.removeCallback();
			tmpdir.removeCallback();

			data.filename = self.file;
			descriptor.removals.forEach(function(removal) {
				var rem = new RegExp(removal, 'g');
				data.stderr = data.stderr.replace(rem, '');
			});

			var linebreak = new RegExp('\n', 'g');
			var tab = new RegExp('\t', 'g');
			data.stderr = data.stderr.replace(linebreak,'</br>').replace(tab,'&nbsp&nbsp&nbsp&nbsp');
			return Promise.resolve(data);
		});
	};
	
	this.start = function(timeout) {
		//Check if script needs to be compiled first
		var name = this.name;
		var version = this.version;
		var file = this.file;
		var tmp = this.tmp;
		var descriptor = this.descriptor; 

		if( descriptor.needsCompile() ) {
			return self.compile(descriptor, timeout).then(function(data) {
				//Check if compiled file has been created
				var compiledName = descriptor.compiledName(file);
				var compiledFile = path.join(tmpdir.name, compiledName);

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

	this.compiled = function(path) {
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

	this.exists = function() {
		var generator = new Generator(this.tmpDir, this.guestRoot);
		var command = generator.exists(this.name);

		var fork = new Fork();
		return fork.fork(command).then(function(data) {
			if(data.stdout !== '') {
				return Promise.resolve(true);
			} else {
				return Promise.resolve(false);
			}
		});
	}

	this.kill = function() {
		var generator = new Generator(this.tmpDir, this.guestRoot);
		var command = generator.kill(this.name);

		console.log(command);
		var fork = new Fork();
		return fork.fork(command);
	}

	this.compile = function(descriptor, timeout) {
		var generator = new Generator(this.tmpDir, this.guestRoot);
		var command = generator.docker(this.name, this.version, descriptor);
		command += " " + generator.compile(this.file, descriptor);

		var form = new Fork();
		return fork.fork(command, timeout);
	};

	this.exec = function(descriptor, timeout) {
		var generator = new Generator(this.tmpDir, this.guestRoot);
		var command = generator.docker(this.name, this.version, descriptor);
		command += " " + generator.command(this.file, descriptor);

		var fork = new Fork();
		return fork.fork(command, timeout);
	};
};

module.exports = Dockerizer;