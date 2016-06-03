var tape = require("tape"),
	zmq = require("zmq");

tape("client", function(t) {
	var WORK_URL = "tcp://127.0.0.1:3000";
	var project = {
		id:"php_test",
		language:"php",
		version:"5.6",
		documents: {
			index: {
				ext:"php",
				content:"<?php \n\techo \"Hello World!\";"
			}
		}
	};

	var req = zmq.socket("req");
	req.identity = "client" + process.pid;
	req.bind(WORK_URL, function(err) {
		if(err) throw err;

		req.on("message", function(data) {
			console.log("Response:", data.toString());
			t.end();
		});

		var data = JSON.stringify(project);
		req.send(data);
	});
});
