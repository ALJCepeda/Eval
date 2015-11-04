var ScriptManager = function(url) {
	var MongoClient = require("./mongo/mongoclient.js");
	var Promise = require("promise");
	var _ = require("underscore");
	var uid = require("uid");
 	var crypto = require("crypto").createHash("md5");

	var self = this;

	this.mongo = new MongoClient(url);

 	this.getUID = function(max, tries) {
 		var id = uid(8);
 		tries = _.isUndefined(tries) ? 1 : tries;

 		return self.mongo.database().then(function(db) {
 			return new Promise(function(resolve, reject) {
 				var coll = db.collection("Script");
 				coll.find({ id:id })
					.count(function(err, count) {
		 				if(err) { throw err; }

		 				if(count <= 0) {
		 					resolve(id);
		 				} else if(tries >= max) {
		 					reject("getUID: max attempts reached, aborting");
		 				} else {
		 					tries++;
		 					self.getUID(max, tries).then(function(id) {
		 						resolve(id);
		 					}).catch(function(error) {
		 						reject(error);
		 					});
		 				}
		 				
		 				db.close();
	 			});
 			});
 		});
 	};
/*
 	this.scriptExists = function(platform, version, code) {

 	}
*/
 	this.saveScript = function(platform, version, script) {
	 	return self.getUID(5).then(function(id) {

 			return self.mongo.database().then(function(db) {
 				return new Promise(function(resolve, reject) {
 					var entry = {
	 					id:id,
	 					platform:platform,
	 					version:version,
	 					script:script,
	 					created:Date.now()
	 				};

	 				var coll = db.collection("scripts");
	 				coll.insertOne(entry, function(error) {
	 					if(error) { reject(error); }
	 					else { resolve(id); }

	 					db.close();
	 				});
 				});
 			});
 		});

 	};

 	this.getScript = function(id) {
 		return self.mongo.database().then(function(db) {
 			return new Promise(function(resolve, reject) {
 				var coll = db.collection("scripts");
	 			var cursor = coll.find({ id:id });

	 			cursor.nextObject(function(err, doc) {
	 				if(err) { reject(err); }
	 				else { resolve(doc); }

	 				db.close();
	 			});
	 		});
 		});
	 };
};

module.exports = ScriptManager;