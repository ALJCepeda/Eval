var PGClient = require('./../resources/pgclient');
var Promise = require('bluebird');
var tape = require('tape');
var url = 'postgres://vagrant:password@localhost/eval';

var pg = new PGClient(url);

tape('info', function(t) {
	pg.info().then(function(info) {
		t.ok(info.PHP, 'PHP');
		t.ok(info.NodeJS, 'NodeJS');
		t.ok(info.Haskell, 'Haskell');
		t.ok(info.Pascal, 'Pascal');

		t.deepEqual(
			info.PHP.tags,
			[ 'latest', '5.6', '5.4', '5.5' ],
			'PHP tags'
		);

		t.deepEqual(
			info.NodeJS.tags,
			[ 'latest', '0.12.7' ],
			'NodeJS tags'
		);

		t.deepEqual(
			info.Haskell.tags,
			[ 'latest', '7.10.2' ],
			'Haskell tags'
		);

		t.deepEqual(
			info.Pascal.tags,
			[ 'latest', '2.6.4' ],
			'Pascal tags'
		);
	}).catch(t.fail).done(t.end);
});

/*
tape('project_names', function(t) {
	pg.project_names()
		.then(t.pass)
		.catch(t.fail)
		.done(t.end);
});

tape('project_insert/project_delete', function(t) {
	var project = {
		name:'phpTest',
		platform:'PHP',
		tag:'5.6',
		documents:
		[
			{
				name:'index',
				extension:'php',
				content:'<?php require(\'helloWorld.php\');'
			}, {
				name:'helloWorld',
				extension:'php',
				content:'<?php \n\techo \'Hello World!\');'
			}
		]
	};

	pg.project_insert(project).then(function(result) {
		console.log(result);
		t.pass("Inserted project");
		return pg.document_insert_many(project.name, project.documents);
	}).then(function(result) {
		console.log(result);
		t.pass("Inserted documents");
		return pg.document_delete_many(project.name, project.documents);
	}).then(function(result) {
		console.log(result);
		t.pass("Deleted documents");
		return pg.project_delete(project);
	}).then(function(result) {
		console.log(result);
		t.pass("Deleted project");
	}).catch(t.fail).done(t.end);
});*/
