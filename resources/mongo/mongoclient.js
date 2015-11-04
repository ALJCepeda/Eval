var MongoClient = function(url) {
	var MongoClient = require("mongodb").MongoClient;
	var Promise = require("promise");

	var self = this;
	this.url = url;
	this.connect = function() {
		return new Promise(function(resolve, reject) {
			MongoClient.connect(self.url, function(err, db) {
				if(err) {
					return reject({ error:err, db:db });
				} 

				return resolve({ error:err, db:db });
			});
		});
	};
};

module.exports = MongoClient;