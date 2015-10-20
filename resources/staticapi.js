



var Staticy = function(app) {
	var express = require('express');
	var path = require('path');
	var config = require('../config.js');
	var session = require('cookie-session');
	var bodyparser = require("body-parser");

	var appDir = path.dirname(require.main.filename);

	app.use(session({
  		name: 'session',
  		secret: 'B9954618C6B579337B63C3C581924'
	}));

	app.use(bodyparser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	}));

	app.use(express.static(path.join(appDir, 'client')));
};

module.exports = Staticy;