var pg = require('pg');
var File = require('./file');
var Promise = require('bluebird');
var Val = require('bareutil').Val;

var SQL = new File('./queries', 'sql');

var PGClient = function(url) {
	this.url = url;
};

PGClient.prototype.info = function() {
	return new Promise(function(resolve, reject) {
		pg.connect(this.url, function(err, client, done) {
			if(err) return reject(err);

			SQL.read('info').then(function(query) {
				client.query(query, function(err, result) {
					if(err) return reject(err);

					resolve(result.rows);
					done();
				});
			}).catch(reject);
		});
	}.bind(this)).reduce(function(info, row) {
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
