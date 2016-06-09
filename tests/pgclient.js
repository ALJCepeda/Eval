var PGClient = require('./../resources/pgclient');
var tape = require('tape');
var url = 'postgres://vagrant:password@localhost/eval';

var pg = new PGClient(url);
tape("connect", function(t) {
	pg.info().then(function(info) {
		console.log(info.NodeJS.documents);
		//console.log(rows);
		/*var row = rows[0];

		t.equal( row.name, 'PHP', 'Primary key' );
		t.equal( row.platform, 'PHP', 'Name of the platform' );
		t.equal( row.tag, 'latest', 'latest is default tag of demo projects' );

		t.end();*/
	}).catch(t.fail);
});
