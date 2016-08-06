var fs = require('fs')
var express = require('express');
var eval_shared = require('eval_shared');

var config = require('./config.js');

var app = express();
var http = require('http').Server(app);
var pgdb = new eval_shared.PGAgent(process.env.PSQL_EVAL);

fs.readdir('node_modules/ace-builds/src-min', function(err, files) {
	if(err) throw err;

	var themes = files.filter(function(file) {
		return file.indexOf('theme-') !== -1;
	}).map(function(file) {
		return file.substring(0, file.length-3).substring(6);
	});

	pgdb.platform().then(function(platformInfo) {
		var StaticAPI = require('./scripts/staticapi.js');
		var staticy = new StaticAPI(app);

		var info = {
			meta:platformInfo,
			themes:themes
		};

		var RestAPI = require('./scripts/restapi.js');
		var rest = new RestAPI(config.workURL, pgdb, app, info);

		http.listen(config.port, function() { console.log('listening on *: ' + config.port); });
	});
});
