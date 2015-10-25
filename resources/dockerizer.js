var shell = require("child_process");

var Dockerizer = function() {
	var self = this;
	this.shouldRemove = true;
	this.mounted = [ ];
	this.name = '';
	this.repository = '';
	this.version = '';
	this.cmd = '';
	this.args =  [ ];

	this.generateCommand = function() {
		var cmd = "sudo docker run";
		cmd += (self.shouldRemove) ? ' --rm' : '';

		cmd += self.mounted.reduce(function(pre, mount) {
			return pre + ' -v ' + mount.host + ':' + mount.guest; 
		}, '');

		cmd += ' ' + self.repository + ':' + self.version + ' ' + self.cmd;

		cmd += self.args.reduce(function(pre, arg) {
			return pre + ' ' + arg;
		}, '');

		return cmd;
	};
	this.run = function(success, failure) {
		var command = self.generateCommand();

		console.log("Executing docker command");
		shell.exec(command, function(error, stdout, stderr) {
			console.log("Docker finished, sending result");
			if(error) {
				console.log("Docker: " + stderr);
				failure(error, stderr);
			} else {
				success(stdout);
			}
		});
	};
};

module.exports = Dockerizer;