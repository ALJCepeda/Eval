var MongoClient = require("mongodb").MongoClient;
var Promise = require("promise");
var uid = require("uid");

var ScriptManager = function(url) {
	var self = this;
	var uid_tries = 0;

	this.url = url;
 	this.getUID = function(max) {
 		var id = uid(8);
 		uid_tries++;

 		return new Promise(function(resolve, reject) {
 			MongoClient.connect(self.url, function(err, db) {
 				var cursor = db.collection("scripts").find({ id:id });
 				cursor.each(function(err, doc) {
 					if(err !== null) {
 						uid_tries = 0;
 						reject(err, doc);
 					} else if(doc === null) {
 						//Found a free UID, send it back
 						uid_tries = 0;
 						resolve(id);
 					} else {
 						if(uid_tries >= max) {
 							uid_tries = 0;
 							reject("getUID: Reached max attempts, aborting", doc);
 						}

 						self.getUID(max).then(resolve, reject);
 					}
 				});
 			});
 		});
 	};

 	this.saveScript = function(platform, version, script) {
 		return new Promise(function(resolve, reject) {
	 		self.getUID().then(function(id) {
	 			
	 			MongoClient.connect(self.url, function(err, db) {
		 			var now = Date.now();
		 			db.collection("scripts").insertOne({
		 				id:id,
		 				platform:platform,
		 				version:version,
		 				script:script,
		 				created:now
		 			}, function(err, result) {
		 				if(err) {
		 					reject({ error:err });
		 				} else {
		 					resolve({ id:id, result:result });
		 				}
		 				db.close();
	 				});
				});
	 		}).catch(function(err){
				console.log("getUID: " + err);
			});
 		});
 		
 	};

 	this.getScript = function(id) {
 		return new Promise(function(resolve, reject) {
	 		MongoClient.connect(self.url, function(err, db) {
	 			var cursor = db.collection("scripts").find({ id:id });
	 			cursor.each(function(err, doc) {
	 				if(err) {
	 					reject({ error:err });
	 				} else {
	 					resolve({ doc:doc });
	 				}
	 				db.close();
	 			});
	 		});
	 	});
 	};
};

module.exports = ScriptManager;