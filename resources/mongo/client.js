var MongoClient = function(url) {
	var MongoClient = require("mongodb").MongoClient;
	var Promise = require("promise");

	var self = this;
	this.url = url;
	this.database = function() {
		return new Promise(function(resolve, reject) {
			MongoClient.connect(self.url, function(error, db) {
				if(error) {
					return reject(error);
				} 

				return resolve(db);
			});
		}).catch(function(error) {
			console.log("Error encountered while connecting to mongo: " + error);
		});
	};
};

module.exports = MongoClient;