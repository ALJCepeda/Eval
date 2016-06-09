var pg = require('pg');
var B = require('bareutil');

var SimplePG = function(url) {
	this.action = 'SELECT';
	this.url = url;
	this.columns = [];
	this.from = '';
	this.where = [];
};

SimplePG.prototype.select = function(columns) {
	this.action = 'SELECT';
	this.columns.push.apply(null, colmns);
};

SimplePG.prototype.from = function(table) {
	this.from = table;
};

SimplePG.prototype.sqlAction = function() {
	switch(this.action) {
		case 'SELECT':
			return 'SELECT {columns}';
		default:
			throw 'Unrecognized action';
	}
};

SimplePG.prototype.build = function() {
	var sqlAction = B.supplant(this.sqlAction(), { columns:this.columns.join(", ") });
	var sqlFrom = B.supplant("FROM {from}", { from:this.from });
};

SimplePG.prototype.query = function(values) {
	pg.connect(this.url, function(err, client, done) {
		if(err) throw err;

		var query = this.build();
		client.query(query)
	}.bind(this));
};
