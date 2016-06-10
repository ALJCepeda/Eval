var pg = require('pg');
var File = require('./file');
var Promise = require('bluebird');
var Val = require('bareutil').Val;

var SQL = new File('./queries', 'sql');

var PGClient = function(url) {
	this.url = url;
};

PGClient.prototype.query = function(name, args) {
	args  = args || [];
	return new Promise(function(resolve, reject) {
		pg.connect(this.url, function(err, client, done) {
			if(err) return reject(err);

			SQL.read(name).then(function(query) {
				client.query(query, args, function(err, result) {
					if(err) return reject(err);

					done();
					resolve(result.rows);
				});
			});
		});
	}.bind(this));
};

PGClient.prototype.project_insert = function(project) {
	return this.query('project_insert', [ project.name, project.platform, project.tag ]);
};

PGClient.prototype.project_delete = function(project) {
	return this.query('project_delete', [ project.name ]);
};

PGClient.prototype.project_names = function() {
	return this.query('project_names');
};

PGClient.prototype.info = function() {
	return this.query('info').reduce(function(info, row) {
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
