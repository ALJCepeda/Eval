var zmq = require('zmq');
var bodyparser = require('body-parser');
var config = require('../config.js');

var RestAPI = function(workURL, app, info) {
	var self = this;

	var jsoner = bodyparser.json();
	this.workurl = workURL;
	this.routes = {};
	this.info = info;

	app.use(jsoner);
	app.use(function (error, req, res, next){
    	//Catch json error
    	console.log('Error encountered');
    	res.sendStatus(400);
    	next(error);
	});

	app.get('/info', jsoner, function(req, res) {
		res.setHeader('content-type', 'application/json');
		var data = JSON.stringify(info);
		res.send(data);
 	}.bind(this));

	app.post('/compile', jsoner, function(req, res) {
		res.setHeader('content-type', 'application/json');
		if(this.validCompileRequest(req) === false) {
			return res.sendStatus(400);
		}

		console.log(req.body);
		/*
		var project = JSON.parse(req.body);
		console.log(project);
*/

		res.send('Valid');
		/*
		var zmqReq = zmq.socket('zmq');
		zmqReq.connect(workURL);
		zmqReq.on('message', function(data) {
			var response = JSON.parse(data);

			res.send({ status:200, id:id, stdout:response.stdout, stderr:response.stderr });
			console.log('Reponse ' + count + ':', response.stdout);
			send();
		});

		var data = JSON.stringify(project);
		zeroReq.send(data);*/
	}.bind(this));

	app.get('/script/:id', jsoner, function(req, res) {
 		var scripter = new ScriptManager(config.urls.mongo);
 		scripter.getScript(req.params.id).then(function(doc) {
 			res.send(doc || {});
 		}).catch(function(error) {
 			keeper.record('getScript', error, true);
 			res.send({ status:500, message:'We were unable to complete your request, please try again later'});
 		});
 	});
};

RestAPI.prototype.validCompileRequest = function(req) {
	if(typeof req.body === 'undefined') {
		console.log('Invalid request: No body');
		return false
	}

	if(typeof req.body.documents === 'undefined') {
		console.log('Invalid request: No documents');
		return false;
	}
	if(typeof req.body.platform === 'undefined') {
		console.log('Invalid request: No platform');
		return false;
	}

	var meta = this.info.meta[req.body.platform]
	if(typeof meta === 'undefined') {
		console.log('Invalid request: Unrecognized platform');
		return false;
	}

	if(meta.tags.indexOf(req.body.tag) === -1) {
		console.log('Invalid request: Unsupported tag');
		return false;
	}

	return true;
};

module.exports = RestAPI;
