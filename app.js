var app = require('express')();
var path = require('path');
var http = require('http').Server(app);
var config = require('./config.js');

require('./resources/staticapi.js')(app);
require('./resources/restapi.js')(app);

app.get('/', function(req, res){ 
	res.sendFile(path.join(__dirname, 'index.html'));
});

http.listen(config.port, function() { console.log('listening on *: ' + config.port)});