var tmp = require("tmp");
var path = require("path");
var fs = require("fs");

var Temper = function(root) {
	this.root = root;
	this.folders = [];
	this.files = [];

	this.cleanup = function() {
		this.files.forEach(function(file) {
			file.removeCallback();
		});

		this.folders.forEach(function(dir) {
			dir.removeCallback();
		});

		this.folders = [];
		this.files = [];
	};

	this.createCode = function(code, ext, folder) {
		folder = folder || "";

		var dir = this.createFolder(folder);
		var file = this.createFile(dir.name);

		fs.writeSync(file.fd, code);

		return {
			dir:dir,
			file:file
		};
	};

	this.createFolder = function(folder) {
		var dir = tmp.dirSync({ mode:0744, template:path.join(this.root, folder, "XXXXXXX"), unsafeCleanup:true });
		this.folders.push(dir);
		return dir;
	};

	this.createFile = function(dir, ext) {
		var file = tmp.fileSync({ mode:0744, postfix:"." + ext, dir:dir });
		this.files.push(file);
		return file;
	};
};

module.exports = Temper;