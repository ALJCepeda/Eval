var assert = require('assert');
var should = require('should');

var DockerFork = require('../fork');
var Temper = require('../temper');
var descriptors = require('../descriptors');

describe('Dockerizer', function() {
	describe('Container Creation', function() {
		const output = "console.log('Hello World!');";
		const delay = "setTimeout(function() { console.log('done'); }, 1000);";
		const infinite = "while(true) { }";
		const infout = "while(true) { console.log('Hello World!'); }";

		var tmpDir = "/var/tmp/eval";
		
		it('should create a nodejs container and output', function(done) {
			var nodejs = descriptors.nodejs;
			nodejs.version = 'latest';
			
			var temper = new Temper(tmpDir);
			var tmp = temper.createCode(output, 'js', 'test');
			
			var dockerfork = new DockerFork(tmp.dirname, nodejs, tmp);

			dockerfork.execute().then(function(result) {
				(result.stdout).should.equal("Hello World!\n");
				done();
			}).catch(done).finally(temper.cleanup);
		}); 
/*
		it('should exist', function(done) {
			var dockerizer = new Dockerizer(tmpDir);
			var nodejs = descriptors.nodejs;

			dockerizer.execute(delay, 'latest', nodejs);

			//Give docker a chance to create the container before querying it
			setTimeout(function() {
				dockerizer.exists().then(function(exists) {
					(exists).should.equal(true);
					done();
				}).catch(function(error) {
					done(error);
				});
			}, 50);
		});
		
		it('should kill', function(done) {
			var dockerizer = new Dockerizer(tmpDir);
			var nodejs = descriptors.nodejs;

			dockerizer.execute(delay, 'latest', nodejs);

			setTimeout(function() {
				dockerizer.kill().then(function(data) {
					dockerizer.exists().then(function(exists) {
						(exists).should.equal(false);
						done();
					});
				}).catch(function(error) {
					done(error);
				});
			}, 25);
		});
/*
		it('should timeout', function(done) {
			var dockerizer = new Dockerizer(tmpDir);
			var nodejs = descriptors.nodejs;

			dockerizer.execute(delay, 'latest', nodejs, function() {

			});
		});
*/
	});
});