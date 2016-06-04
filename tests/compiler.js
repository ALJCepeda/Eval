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

	var count = 0;
	var send = function() {
		var data;
		if(count % 2 === 0) {
			data = JSON.stringify(nodejs);
		} else {
			data = JSON.stringify(php);
		}

		count++;
		req.send(data);
	};

	var req = zmq.socket("req");
	req.identity = "client" + process.pid;
	req.bind(WORK_URL, function(err) {
		if(err) throw err;

		req.on("message", function(data) {
			var response = JSON.parse(data);
			console.log("Reponse " + count + ":", response.stdout);
			send();
		});

		send();
	});
});
