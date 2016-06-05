var StaticAPI = function() {
	var express = require('express');
	var path = require('path');
	var bodyparser = require("body-parser");

	this.routes = {};
	this.bootstrap = function(app) {
		app.use(bodyparser.urlencoded({     // to support URL-encoded bodies
		  extended: true
		}));

		app.use(express.static(path.join(global.ROOT, 'client')));
	};

	this.routes.index = function(app, method) {
		app.get('/', function(req, res){
			res.sendFile(path.join(global.ROOT, 'client', 'index.html'));
		});
	};
};

module.exports = StaticAPI;
