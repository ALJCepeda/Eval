var zmq = require('zmq');
var bodyparser = require('body-parser');
var config = require('../config.js');
var bare = require('bareutil');
var val = bare.val;

var RestAPI = function(workURL, app, info) {
	var self = this;

	app.use(bodyparser.urlencoded({
	    extended: true
	}));
	app.use(bodyparser.json());

	this.workurl = workURL;
	this.routes = {};
	this.info = info;

	app.use(function (error, req, res, next){
    	//Catch json error
    	console.log('Error encountered');
    	res.sendStatus(400);
    	next(error);
	});

	app.get('/info', function(req, res) {
		res.setHeader('content-type', 'application/json');
		var data = JSON.stringify(info);
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
			console.log('Project ID:', response.id);

			req.close();
			res.send({
				status:200,
				id:response.id,
				stdout:response.stdout,
				stderr:response.stderr,
				error:response.error
			});
		}.bind(this));

		req.connect(this.workurl);

		var data = JSON.stringify(project);
		req.send(data);

		console.log('Request', requestNum);
	}.bind(this));
};

RestAPI.prototype.validCompileRequest = function(req) {
	if(val.undefined(req.body) === true) {
		console.log('Invalid request: No body');
		return false
	}

	if(val.undefined(req.body.documents) === true) {
		console.log('Invalid request: No documents');
		return false;
	}
	if(val.undefined(req.body.platform) === true) {
		console.log('Invalid request: No platform');
		return false;
	}

	var meta = this.info.meta[req.body.platform]
	if(val.undefined(meta) === true) {
		console.log('Invalid request: Unrecognized platform');
		return false;
	}

	if(meta.tags.indexOf(req.body.tag) === -1) {
		console.log('Invalid request: Unsupported tag');
		return false;
	}

	var documents = req.body.documents;
	var valid = true;
	var hasIndex = false;
	documents.forEach(function(doc) {
		if(this.validDocument(doc) === false) {
			valid = false;
		}

		if(doc.name === 'index') {
			hasIndex = true;
		}
	}.bind(this));

	return valid === true && hasIndex === true;
};

RestAPI.prototype.validDocument = function(document) {
	if(val.undefined(document.name) === true) {
		console.log('Invalid document: Missing name');
		return false;
	}

	if(val.undefined(document.extension) === true) {
		console.log('Invalid document: Missing extension');
		return false;
	}

	if(val.undefined(document.content) === true) {
		console.log('Invalid document: Missing content');
		return false;
	}

	return true;
};

module.exports = RestAPI;
