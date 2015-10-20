var express = require('express');
var path = require('path');

var app = express();
var http = require('http').Server(app);

var config = require('./config.js');

require('./resources/staticapi.js')(app);
require('./resources/restapi.js')(app);

app.get('/', function(req, res){ 
	req.session.lastPage = '/';
	res.sendFile(path.join(__dirname, 'client/index.html'));
});

http.listen(config.port, function() { console.log('listening on *: ' + config.port)});