var zmq = require('zmq');
var bodyparser = require('body-parser');
var config = require('../config.js');
var bare = require('bareutil');
var val = bare.val;

var RestAPI = function(workURL, app, meta) {
	var self = this;

	app.use(bodyparser.urlencoded({
	    extended: true
	}));
	app.use(bodyparser.json());

	this.workurl = workURL;
	this.routes = {};
	this.meta = meta;

	app.use(function (error, req, res, next){
    	//Catch json error
    	console.log('Error encountered');
    	res.sendStatus(400);
    	next(error);
	});

	app.get('/meta', function(req, res) {
		res.setHeader('content-type', 'application/json');
		var data = JSON.stringify(self.meta);
		res.send(data);
 	});

	var requestNum = 0;
	app.post('/compile', function(req, res) {
		res.setHeader('content-type', 'application/json');
		var project = req.body;

		var zmqReq = zmq.socket('req');
		zmqReq.identity = 'eval_' + ++requestNum;
		zmqReq.on('message', RestAPI.onZMQMessage(zmqReq, res, requestNum));
		zmqReq.connect(self.workurl);

		var data = JSON.stringify(project);
		console.log('Request', requestNum);
		zmqReq.send(data);
	});
};

RestAPI.onZMQMessage = function(zmqReq, res, requestNum) {
	return function(data) {
		var response = JSON.parse(data);
		console.log('Reply', requestNum)

		if(response.error) {
			res.send({
				status:500,
				error:'Internal Server Error',
				message:response.message
			});
		}
		console.log('Project ID:', response.id);

		zmqReq.close();
		res.send({
			status:200,
			project:JSON.stringify(response)
		});
	};
};

module.exports = RestAPI;
