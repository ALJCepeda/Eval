var fs = require("fs");
var path = require("path");
var Promise = require("bluebird");

var File = function(base, ext, encoding) {
	this.base = base;
	this.extension = ext;
	this.encoding = encoding || 'utf8';
};

File.prototype.read = function(file, encoding) {
	var encode = encoding || this.encoding;

	return new Promise(function(resolve, reject) {
		var url = path.resolve(this.base, file);
		url = url + "." + this.extension;

		fs.readFile(url, function(err, data) {
			if(err) return reject(err);

			resolve(data.toString(encode));
		});
	}.bind(this));
};

module.exports = File;
