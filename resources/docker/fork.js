var self = this;
var shell = require("child_process");
var Promise = require("promise");
var _ = require("underscore");

var DockerFork = function() {
	this.cmd = "sudo docker run";
	this.killCMD = "sudo docker kill";
	
	this.name = '';
	this.command = '';

	this.timeout = 10000;
};


DockerFork.prototype.start = function(timeout) {
	//Check if script needs to be compiled first
	var self = this;
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

DockerFork.prototype.kill = function() {
	var generator = new Generator(this.tmpDir, this.guestRoot);
	var command = generator.kill(this.name);

	console.log(command);
	var fork = new Fork();
	return fork.fork(command);
};

DockerFork.prototype.exists = function() {
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
};


DockerFork.prototype.fork = function(command, timeout, delay) {
	//Execute docker command
	var promise = new Promise(function(resolve, reject) {
		var process = shell.exec(command, function(error, stdout, stderr) {
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