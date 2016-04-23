var StaticAPI = function() {
	var express = require('express');
	var path = require('path');
	var config = require('../config.js');
	var bodyparser = require("body-parser");

	this.routes = {};
	this.bootstrap = function(app) {
		app.use(bodyparser.urlencoded({     // to support URL-encoded bodies
		  extended: true
		}));

		app.use(express.static(path.join(config.dirs.root, 'client')));
		app.use(express.static(path.join(config.dirs.root, 'bower_components')));
	};

	this.routes.index = function(app, method) {
		app.get('/', function(req, res){ 
			res.sendFile(path.join(config.dirs.root, 'client', 'index.html'));
		});
	};

	this.routes.library = function(app, method) {
		app[method]('/lib/:name', function(req, res){
			var script = config.lib[req.params.name];
			if( typeof script !== 'undefined' ) {
				//Remove extension from dependency name
				var name = req.params.name;
				name = name.substring(0, name.indexOf('.'));

				//Check if dependency is mapped somewhere in the bower directory
				if( typeof config.libMap[name] !== 'undefined' ) {
					name = config.libMap[name];
				}

				//Send file or exception
				res.sendFile(path.join(config.dirs.bower, name, script));
			} else {
				//No dependency by that name
				res.status('404').send('Not Found');
			}
		});
	};
};

module.exports = StaticAPI;