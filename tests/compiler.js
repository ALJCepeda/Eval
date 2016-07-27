var tape = require('tape'),
	zmq = require('zmq');

tape('client', function(t) {
	var nodejs = {
		platform:'nodejs',
		tag:'latest',
		documents: {
			index: {	id:'index',
						extension:'js',
						content:'console.log(\'Hello NodeJS!\')' }
		}
	};

	var php = {
		platform:'php',
		tag:'5.6',
		documents: {
			index: {	id:'index',
						extension:'php',
						content:'<?php echo \'Hello PHP!\'; ' }
		}
	};

	// socket to talk to server
	var sockets = [];
	const WORKER_NUM = 5;
	const SEND_NUM = 5;
	const WORK_URL = 'tcp://127.0.0.1:3000';
	for(var workers = 0; workers < WORKER_NUM; workers ++) {
		var req = zmq.socket('req');
		var identity = 'client' + process.pid + '_' + workers;
		req.identity =  identity;

		var x = 0;
		req.on('message', function(reply) {
			var result = JSON.parse(reply);
			x++;
		  	console.log('Received reply', x, 'and id', result.id);
			if(!result.error) {
				console.log(result.save.stdout);
			} else {
				console.log(result.error);
			}
		});

		req.connect(WORK_URL);

		for (var i = 0; i < SEND_NUM; i++) {
			var project;
			if(i % 2 === 0) {
				project = php;
			} else {
				project =  nodejs;
			}

			var data = JSON.stringify(project);

			console.log('Sending:', data);
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
