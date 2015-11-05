var Dockerizer = function(historian) {
	var shell = require("child_process");
	var uid = require("uid");
	var path = require("path");
	var _ = require("underscore");
	var fs = require("fs");
	var tmp = require("tmp");
	var path = require("path");
	var docker_descriptions = require("./descriptors");

	var self = this;
	this.name = "";
	this.descriptor = {};
	this.shouldRemove = true;
	this.mounts = [];

	this.command = "sudo docker run";
	this.domain = "literphor";
	this.hostRoot = "";
	this.guestRoot = "/scripts";

	this.configure = function(descriptor, name, version) {
		self.name = name;
		self.version = version;
		self.descriptor = descriptor;

		self.hostRoot = path.join("/var/tmp/eval", descriptor.repository, self.name);
		self.image = path.join(self.domain, descriptor.repository) + ":" + self.version;
	};

	this.generate = {
		//Generates docker command based on object"s configuration
		//Dockername is the semantic name for the process running our container
		//Also determines the folder containing the user"s script file
		command: function() {
			//Base docker command
			var cmd = self.command;

			//Will automatically remove docker container when exits
			cmd += (self.shouldRemove) ? " --rm" : "";

			cmd += " --name " + self.name;
			cmd += " -w " + self.guestRoot;

			//Mounts folder containing user's script to /script in guest
			cmd += " -v " + self.hostRoot + ":" + self.guestRoot;

			//Add all mounts to the command in the form -v host:guest
			var mounts = self.mounts.concat(self.descriptor.mounts);
			cmd += mounts.reduce(function(pre, mount) {
				return pre + " -v " + mount.host + ":" + mount.guest; 
			}, "");

			//Add information about the container and command we want to run
			cmd += " " + self.image;

			return cmd;
		}
	};

	this.doCompilation = function(platform, version, script) {
		var descriptor = docker_descriptions[platform];

		var tmpdir = tmp.dirSync({ mode:0744, template:path.join("/var/tmp/eval", platform, "XXXXXXX"), unsafeCleanup:true});
		var tmpfile = tmp.fileSync({ mode:0744, postfix:descriptor.ext, dir:tmpdir.name });

		var filename = path.basename(tmpfile.name);
		var dockername = path.basename(tmpdir.name);

 		fs.writeSync(tmpfile.fd, script);
		self.configure(descriptor, dockername, version);

		return self.start(filename, tmpdir).then(function(data) {
			tmpfile.removeCallback();
			tmpdir.removeCallback();

			data.filename = filename;
			return Promise.resolve(data);
		}).then(function(data) {
			descriptor.removals.forEach(function(removal) {
				var rem = new RegExp(removal, 'g');
				data.stderr = data.stderr.replace(rem, '');
				data.stdout = data.stdout.replace(rem, '');
			});

			var linebreak = new RegExp('\n', 'g');
			var tab = new RegExp('\t', 'g');
			data.stderr = data.stderr.replace(linebreak,'</br>').replace(tab,'&nbsp&nbsp&nbsp&nbsp');
			data.stdout = data.stdout.replace(linebreak,'</br>').replace(tab,'&nbsp&nbsp&nbsp&nbsp');

			return Promise.resolve(data);
		});
	};
	
	this.start = function(file, tmpdir) {
		//Check if script needs to be compiled first
		if( _.isFunction(self.descriptor.compile) ) {
			var command = self.generate.command();
			command += " " + self.descriptor.compile(file);

			return self.exec(command).then(function(data) {
				//Check if compiled file has been created
				var compiledName = self.descriptor.compileName(file);
				var compiledFile = path.join(tmpdir.name, compiledName);

				return new Promise(function(resolve, stat) {
					fs.stat(compiledFile, function(err, stat) {
						if(!stat) {
							//Compilation failed return output
							resolve(data);
						} else {
							//Compilation success, run compiled filed
							self.run(compiledName).then(function(data) {
								resolve(data);
							}).catch(function(error) {
								reject(error);
							});
						}
					});	
				});
			});
		} else {
			return self.run(file);
		}
	};

	this.run = function(file) {
		var command = self.generate.command();
		if( _.isFunction(self.descriptor.command )) {
			command += " " + self.descriptor.command(file, uid);
		} else if( _.isString(self.descriptor.command )) {
			command += " " + self.descriptor.command + file;
		} else {
			command += " " + self.descriptor.repository + " " + file;
		}

		return self.exec(command);
	};

	this.exec = function(command) {
		//Execute docker command
		return new Promise(function(resolve, reject) {
			shell.exec(command, function(error, stdout, stderr) {
				if(error && error.kill === true) {
					reject({ error:error, stderr:stderr, command:command });
				} else {
					resolve({ stdout:stdout, stderr:stderr, command:command });
				}
			});
		});	
	};
};

module.exports = Dockerizer;