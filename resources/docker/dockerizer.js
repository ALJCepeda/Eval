var Dockerizer = function(historian) {
	var Fork = require("./fork.js");
	var uid = require("uid");
	var path = require("path");
	var _ = require("underscore");
	var fs = require("fs");
	var tmp = require("tmp");
	var path = require("path");
	var docker_descriptions = require("./descriptors");

	var self = this;
	this.shouldRemove = true;
	this.mounts = [];

	this.command = "sudo docker run";
	this.killCMD = "sudo docker kill";
	this.domain = "literphor";
	this.tmpDir = "/var/tmp/eval";
	this.guestRoot = "/scripts";
	this.running = '';

	this.generate = {
		//Generates docker command based on object"s configuration
		//Dockername is the semantic name for the process running our container
		//Also determines the folder containing the user"s script file
		docker: function(name, descriptor) {
			//Base docker command
			var cmd = self.command;

			//Will automatically remove docker container when exits
			cmd += (self.shouldRemove) ? " --rm" : "";

			cmd += " --name " + name;
			cmd += " -w " + self.guestRoot;

			//Mounts folder containing user's script to /script in guest
			var hostRoot = path.join(self.tmpDir, descriptor.repository, name);
			cmd += " -v " + hostRoot + ":" + self.guestRoot;

			//Add all mounts to the command in the form -v host:guest
			var mounts = self.mounts.concat(descriptor.mounts);
			cmd += mounts.reduce(function(pre, mount) {
				return pre + " -v " + mount.host + ":" + mount.guest; 
			}, "");

			//Add information about the container and command we want to run
			var image = path.join(self.domain, descriptor.repository) + ":" + descriptor.version;
			cmd += " " + image;

			return cmd;
		},
		command: function(file, descriptor) {
			if( _.isFunction(descriptor.command) ) {
			 	return descriptor.command(file, uid);
			} else {
				return descriptor.command + file;
			}
		},
		compile: function(file, descriptor) {
			if( _.isFunction(descriptor.compile) ) {
				return descriptor.compile(file, uid);
			} else {
				return descriptor.compile + descriptor.compiledName(file);
			}
		}
	};

	this.doCompilation = function(code, descriptor) {
		var tmpdir = tmp.dirSync({ mode:0744, template:path.join(self.tmpDir, descriptor.repository, "XXXXXXX"), unsafeCleanup:true});
		var tmpfile = tmp.fileSync({ mode:0744, postfix:descriptor.ext, dir:tmpdir.name });
		
		var filename = path.basename(tmpfile.name);
		var dockername = path.basename(tmpdir.name);

 		fs.writeSync(tmpfile.fd, code);
		return self.start(dockername, filename, tmpdir, descriptor).then(function(data) {
			tmpfile.removeCallback();
			tmpdir.removeCallback();

			data.filename = filename;
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
	
	this.start = function(name, file, tmpdir, descriptor) {
		//Check if script needs to be compiled first
		if( descriptor.needsCompile() ) {
			return self.compile(name, file, descriptor).then(function(data) {
				//Check if compiled file has been created
				var compiledName = descriptor.compiledName(file);
				var compiledFile = path.join(tmpdir.name, compiledName);

				return self.exists(compiledFile).then(function(exists) {
					if(exists === false) {
						//Failed to compile, send output
						return Promise.resolve(data);
					} 

					return self.run(name, compiledName, descriptor)
				});
			});
		} else {
			return self.run(name, file, descriptor);
		}
	};

	this.exists = function(path) {
		return new Promise(function(resolve, reject) {
			fs.stat(path, function(err, stat) {
				if(err) { reject(err); }
				else if(!stat) {
					resolve(false);
				} else {
					resolve(true);
				}
			})
		});
	};

	this.kill = function(name) {
		var command = self.killCMD;
		command += " " + name;

		var fork = new Fork();
		return fork.exec(command);
	}

	this.compile = function(name, file, descriptor) {
		var command = self.generate.docker(name, descriptor);
		command += " " + self.generate.compile(file, descriptor);
		return self.exec(name, command);
	};

	this.run = function(name, file, descriptor) {
		var command = self.generate.docker(name, descriptor);
		command += " " + self.generate.command(file, descriptor);
		return self.exec(name, command);
	};

	this.exec = function(name, command) {
		var fork = new Fork();
		self.running = fork;

		return new Promise(function(resolve, reject) {
			fork.exec(command, function(process) {
				//Docker process has run longer than timeout
				var stdout = process.stdout;
				self.kill(name).then(function() {
					resolve({ stdout:stdout, stderr:"Process exceeded timeout and was murdered in cold blood", command:command });
				});
			});
		});
	};
};

module.exports = Dockerizer;