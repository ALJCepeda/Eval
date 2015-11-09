var should = require("should");

var descriptors = require("../descriptors.js");
var Generator = require("../generator.js");

describe("Dockerizer", function() {
	describe("Command Generation", function() {
		var tmpDir = "/var/tmp/eval";
		var guestRoot = "/scripts";

		it("should create a run command for docker container", function() {
			var generator = new Generator(tmpDir, guestRoot);
			var nodejs = descriptors.nodejs;
			nodejs.version = "latest";

			should.exist(generator);
			should.exist(nodejs);

			var dockerCMD = generator.docker("test", "latest", nodejs);
			dockerCMD.should.equal("sudo docker run  --rm  --name test  -w /scripts  -v /var/tmp/eval/nodejs/test:/scripts  literphor/nodejs:latest");
		});

		it("should create a kill command for test container", function() {
			var generator = new Generator(tmpDir, guestRoot);

			var killCMD = generator.kill("test");
			killCMD.should.equal("sudo docker kill test");
		});

		it("should create check exists command for test container", function() {
			var generator = new Generator(tmpDir, guestRoot);

			var existsCMD = generator.exists("test");
			existsCMD.should.equal("sudo docker ps | grep 'test'");
		});

		it("should create a compile command for pascal", function() {
			var generator = new Generator(tmpDir, guestRoot);
			var pascal = descriptors.pascal;

			var compileCMD = generator.compile("test.pas", pascal);
			compileCMD.should.equal("fpc test.pas");
		});
	}); 
});