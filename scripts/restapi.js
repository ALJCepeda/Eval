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
 	}.bind(this));

	var requestNum = 0;
	app.post('/compile', function(req, res) {
		res.setHeader('content-type', 'application/json');
		if(this.validCompileRequest(req) === false) {
			return res.sendStatus(400);
		}

		var project = req.body;

		var req = zmq.socket('req');
		req.identity = 'eval_' + ++requestNum;

		req.on('message', function(data) {
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

			req.close();
			res.send({
				status:200,
				payload:JSON.stringify(response)
			});
		}.bind(this));

		req.connect(this.workurl);

		var data = JSON.stringify(project);
		req.send(data);
		console.log('Request', requestNum);
	}.bind(this));
};

module.exports = RestAPI;
