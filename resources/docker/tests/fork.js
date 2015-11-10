var assert = require('assert');
var should = require('should');

var DockerFork = require('../fork');
var Temper = require('../temper');
var descriptors = require('../descriptors');

describe('Dockerizer', function() {
	describe('Container Creation', function() {
		const output = "console.log('Hello World!');";
		const delay = "setTimeout(function() { console.log('Hello World!'); }, 100);";
		const infinite = "while(true) { }";
		const infout = "while(true) { console.log('Hello World!'); }";

		var tmpDir = "/var/tmp/eval";
	
		it('should create a nodejs container and output', function(done) {
			var nodejs = descriptors.nodejs;
			nodejs.version = 'latest';

			var temper = new Temper(tmpDir);
			var tmp = temper.createCode(delay, 'js', 'test');
			
			var dockerfork = new DockerFork("test", nodejs, tmp);
			
			dockerfork.execute().then(function(result) {
				(result.stdout).should.equal("Hello World!\n");
				done();
				//return dockerfork.remove();
			}).catch(done).finally(temper.cleanup);
		});

		it('should exist', function(done) {
			var nodejs = descriptors.nodejs;
			nodejs.version = "latest";

			var temper = new Temper(tmpDir);
			var tmp = temper.createCode(delay, "js", "test");

			var dockerfork = new DockerFork("test", nodejs, tmp);

			dockerfork.execute().then(function(result) {
				temper.cleanup();
				done();
			}).catch(done);

			//Give docker a chance to create the container before querying it
			setTimeout(function() {
				dockerfork.exists().then(function(exists) {
					(exists).should.equal(true);
				}).catch(done);
			}, 50);
		});/*
		
		it('should kill', function(done) {
			var nodejs = descriptor.nodejs;
			nodejs.version = "latest";

			var temper = new Temper(tmpDir);
			var tmp = temper.createCode(delay, "js", "test");

			var dockerfork = new DockerFork("test", nodejs, tmp);
			dockerfork.execute().catch(done);

			setTimeout(function() {
				dockerfork.kill().then(function(data) {
					dockerfork.exists().then(function(exists) {
						(exists).should.equal(false);
						done();
					});
				}).catch(done).finally(temper.cleanup);
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