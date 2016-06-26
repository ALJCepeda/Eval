var fs = require('fs')
var express = require('express');
var app = express();
var http = require('http').Server(app);

var config = require('./config.js');
var PGClient = require('./libs/eval_pgclient');
var pgdb = new PGClient('postgres://vagrant:password@localhost/eval');

var bare = require('./libs/bareutil');
bare.misc.expose(app, express);
bare.ajax.expose(app, express);

app.use('/bluebird.js', express.static('./node_modules/bluebird/js/browser/bluebird.js'));
app.use('/newsfeed.js', express.static('./libs/newsfeed/index.js'));
app.use('/materialize', express.static('./node_modules/materialize-css/dist'));
app.use('/jquery.js', express.static('./node_modules/jquery/dist/jquery.min.js'));
app.use('/require.js', express.static('./node_modules/requirejs/require.js'));
app.use('/knockout.js', express.static('./node_modules/knockout/build/output/knockout-latest.js'));
app.use('/underscore.js', express.static('./node_modules/underscore/underscore-min.js'));
app.use('/backbone.js', express.static('./node_modules/backbone/backbone-min.js'));
app.use('/ace-builds', express.static('./node_modules/ace-builds'));

var WORK_URL = 'tcp://127.0.0.1:3000';

fs.readdir('/sources/eval/node_modules/ace-builds/src-min', function(err, files) {
	if(err) throw err;

	var themes = files.filter(function(file) {
		return file.indexOf('theme-') !== -1;
	}).map(function(file) {
		return file.substring(0, file.length-3).substring(6);
	});

	pgdb.meta().then(function(meta) {
		var StaticAPI = require('./scripts/staticapi.js');
		var staticy = new StaticAPI(app);

		var info = {
			meta:meta,
			themes:themes
		};

		var RestAPI = require('./scripts/restapi.js');
		var rest = new RestAPI(WORK_URL, app, info);

		http.listen(config.port, function() { console.log('listening on *: ' + config.port); });
	});
});
