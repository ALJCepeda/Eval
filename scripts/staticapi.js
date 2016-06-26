var StaticAPI = function(app) {
	var express = require('express');
	var path = require('path');
	var bodyparser = require("body-parser");

	app.use(bodyparser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	}));

	app.use(express.static(path.join(global.ROOT, 'client')));

	app.get('/', function(req, res){
		res.sendFile(path.join(global.ROOT, 'client', 'index.html'));
	});
};

module.exports = StaticAPI;
