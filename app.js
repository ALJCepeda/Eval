var fs = require('fs')
var express = require('express');
var bare = require('bareutil');
var eval_shared = require('eval_shared');

var config = require('./config.js');

var app = express();
var http = require('http').Server(app);
var pgdb = new eval_shared.PGAgent('postgres://vagrant:password@localhost/eval');

eval_shared.Document.expose(app, express);
eval_shared.Save.expose(app, express);
eval_shared.Project.expose(app, express);
bare.val.expose(app, express);
bare.misc.expose(app, express);
bare.ajax.expose(app, express);
app.use('/bluebird.js', express.static('./node_modules/bluebird/js/browser/bluebird.js'));
app.use('/newsfeed.js', express.static('./libs/newsfeed/index.js'));
app.use('/dropdownjs', express.static('./libs/dropdown.js'))
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));
app.use('/bootstrap-md', express.static('./node_modules/bootstrap-material-design/dist'));
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

	pgdb.platform().then(function(platformInfo) {
		var StaticAPI = require('./scripts/staticapi.js');
		var staticy = new StaticAPI(app);

		var info = {
			meta:platformInfo,
			themes:themes
		};

		var RestAPI = require('./scripts/restapi.js');
		var rest = new RestAPI(WORK_URL, app, info);

		http.listen(config.port, function() { console.log('listening on *: ' + config.port); });
	});
});
