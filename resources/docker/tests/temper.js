var assert= require('assert');
var should = require('should');

var Tempter = require('../temper.js');
var descriptors = require('../descriptors.js');
var Generator = require('../generator.js');

describe('Temper', function() {
	describe('Path creation', function() {
		var tmpDir = "/var/tmp/eval";

		it('should create a folder', function() {
			var temper = new Tempter(tmpDir);

			var folder = tempter.createFolder('test');
			console.log(folder.name);
		});
	});
});