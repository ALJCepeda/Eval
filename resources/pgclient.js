var pg = require('pg');
var File = require('./file');
var Promise = require('bluebird');
var Val = require('bareutil').Val;

var SQL = new File('./queries', 'sql');

var PGClient = function(url) {
	this.url = url;
};

/* PSQL related semantic closures */
var rowCount = function(result) { return result.rowCount; };
var rowCount_reduce = function(pre, result) { return pre + rowCount(result); };
var rows = function(result) { return result.rows; };
var rows_map = function(result) { return rows(result); };

/* Reads SQL file and performs query with parameterized args */
PGClient.prototype.query = function(name, args) {
	var self = this;
	args  = args || [];

	return SQL.read(name).then(function(query) {
		return new Promise(function(resolve, reject) {
			pg.connect(self.url, function(err, client, done) {
				if(err) return reject(err);

				client.query(query, args, function(err, result) {
					if(err) return reject(err);

					done();
					resolve(result);
				});
			});
		});
	});
};

/*  Does query over multi-dimensional array */
PGClient.prototype.query_many = function(name, multiArgs) {
	var self = this;
	multiArgs = multiArgs || [[]];

	return SQL.read(name).then(function(query) {
		var promises = [];

		multiArgs.forEach(function(args) {
			var promise = self.query(name, args);
			promises.push(promise);
		});

		return Promise.all(promises);
	});
};

/*
##############Section begins query specific operations
*/
PGClient.prototype.document_insert_many = function(projectName, documents) {
	var multiArgs = documents.map(function(document) {
		return [ projectName, document.name, document.extension, document.content ];
	});

	return this.query_many('document_insert', multiArgs).reduce(rowCount_reduce);
};

PGClient.prototype.document_delete_many = function(projectName, documents) {
	var multiArgs = documents.map(function(document) {
		return [ projectName, document.name ];
	});

	return this.query_many('document_delete', multiArgs).reduce(rowCount_reduce);
};

PGClient.prototype.document_insert = function(projectName, document) {
	return this.query('document_insert',
		[ 	projectName,
			document.name,
			document.extension,
			document.content ]).then(rowCount);
};

PGClient.prototype.document_delete = function(projectName, document) {
	return this.query('document_delete',
		[ 	projectName,
			document.name ]).then(rowCount);
};

PGClient.prototype.project_insert = function(project) {
	return this.query('project_insert',
		[ 	project.name,
			project.platform,
			project.tag ]).then(rowCount);
};

PGClient.prototype.project_delete = function(project) {
	return this.query('project_delete',
		[ project.name ]).then(rowCount);
};

PGClient.prototype.project_names = function() {
	return this.query('project_names').then(rows);
};

PGClient.prototype.info = function() {
	return this.query('info').then(rows).reduce(function(info, row) {
			var name = row.name;

			if(Val.undefined(info[name]) === true) {
				info[row.name] = {
					tags:[],
					documents:[],
				};
			}

			info[name].tags.push(row.tag);

			if(Val.defined(row.content) === true) {
				info[name].documents.push({
					name:row.name,
					extension:row.extension,
					content:row.content
				});
			}

			return info;
		}, {});
};

module.exports = PGClient;
