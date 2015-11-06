var Fork = function() {
	var self = this;
	var shell = require("child_process");
	var _ = require("underscore");
	this.process = '';
	this.timeout = 200;

	this.exec = function(command, timeout) {
		//Execute docker command
		return new Promise(function(resolve, reject) {
			var process = shell.exec(command, function(error, stdout, stderr) {
				if(error && error.kill === true) {
					reject({ error:error, stderr:stderr, command:command });
				} else {
					resolve({ stdout:stdout, stderr:stderr, command:command });
				}

				self.process = '';
			});

			self.process = process;
			if(self.timeout > 0) {
				setTimeout(function() {
					if(self.process !== '') {
						if(_.isFunction(timeout)) {
							timeout(self.process);
						}
					}
				}, self.timeout);
			}
		});	
	};
}

module.exports = Fork;