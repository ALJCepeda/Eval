var PGClient = require('./../resources/pgclient');
var tape = require('tape');
var url = 'postgres://vagrant:password@localhost/eval';

var pg = new PGClient(url);

tape("info", function(t) {
	pg.info()
		.then(t.pass)
		.catch(t.fail)
	 	.done(t.end);
});
tape("project_names", function(t) {
	pg.project_names()
		.then(t.pass)
		.catch(t.fail)
		.done(t.end);
});

tape("project_insert/project_delete", function(t) {
	var project = {
		name:"phpTest",
		platform:"PHP",
		tag:"5.6",
		documents: {
			index: {
				ext:"php",
				content:"<?php \n\techo \"This is a test script\";"
			}
		}
	};

	pg.project_insert(project)
		.then(t.pass)
		.catch(t.fail);

	pg.project_delete(project)
		.then(t.pass)
		.catch(t.fail)
		.done(t.end);
});
