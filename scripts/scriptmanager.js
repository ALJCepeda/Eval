var ScriptManager = function(url) {
	var MongoClient = require("./mongo/client.js");
	var Promise = require("promise");
	var _ = require("underscore");
	var uid = require("uid");
	
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

 	this.digest = function(code) {
 		return require("crypto").createHash("md5").update(code).digest("hex");
 	};

 	this.exists = function(id, code) {
 		return self.mongo.database().then(function(db) {
 			return new Promise(function(resolve, reject) {
 				var coll = db.collection("scripts");
 				var md5 = self.digest(code);

	 			coll.find({ id:id, md5:md5 }).nextObject(function(error, obj) {
	 				if(error) { reject(error); }
	 				else if( obj === null ) {
	 					resolve(false);
	 				} else {
	 					resolve(obj.md5 === md5);
	 				}

	 				db.close();
	 			});
 			});
 		});
 	};

 	this.saveScript = function(platform, version, code, lastID) {
 		return self.exists(lastID, code).then(function(exists) {
 			if(exists === true) {
 				return Promise.resolve(lastID);
 			} else {
 				return self.doSave(platform, version, code);
 			}
 		});
 	};

 	this.doSave = function(platform, version, code) {
 		return self.getUID(5).then(function(id) {
 			return self.mongo.database().then(function(db) {
 				return new Promise(function(resolve, reject) {
 					var md5 = self.digest(code);

 					var entry = {
	 					id:id,
	 					platform:platform,
	 					version:version,
	 					md5:md5,
	 					code:code,
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