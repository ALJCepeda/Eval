var express = require('express');
var path = require('path');
var bare = require('bareutil');
var bodyparser = require("body-parser");
var eval_shared = require('eval_shared');

var StaticAPI = function(app) {
	app.use(bodyparser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	}));

	app.use(express.static(path.join(__dirname, '..', 'client')));

	app.get('/', function(req, res){
		res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
	});

	eval_shared.Document.expose(app, express);
	eval_shared.Save.expose(app, express);
	eval_shared.Project.expose(app, express);
	bare.obj.expose(app, express);
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
};

module.exports = StaticAPI;
