var tape = require("tape"),
	zmq = require("zmq");

tape("client", function(t) {
	var WORK_URL = "tcp://127.0.0.1:3000";
	var nodejs = {
		id:"nodejs_test",
		language:"nodejs",
		version:"latest",
		documents: {
			index: {
				ext:"js",
				content:"console.log(\"Hello NodeJS!\")"
			}
		}
	};

	var php = {
		id:"php_test",
		language:"php",
		version:"5.6",
		documents: {
			index: {
				ext:"php",
				content:"<?php echo \"Hello PHP!\"; "
			}
		}
	};

	// socket to talk to server
	var sockets = [];

	for(var workers = 0; workers < 10; workers ++) {
		var req = zmq.socket('req');
		var identity = "client" + process.pid + "_" + workers;
		req.identity =  identity;

		var x = 0;
		req.on("message", function(reply) {
			var result = JSON.parse(reply);
		  	console.log("Received reply #"+ x++ +":", result.stdout);
		});

		req.connect("tcp://localhost:5555");

		for (var i = 0; i < 5; i++) {
			var project;
			if(i % 2 === 0) {
				project = nodejs;
			} else {
				project =  php;
			}
			project.id = identity + "_" + i;
			var data = JSON.stringify(project);

			console.log("Sending:", data);
			req.send(data);
		}

		sockets.push(req);
	}

	process.on('SIGINT', function() {
		sockets.forEach(function(sock) {
			sock.close();
		});
	});
});
