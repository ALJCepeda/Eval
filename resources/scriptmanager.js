var ScriptManager = function(url) {
	var MongoClient = require('./mongo/mongoclient.js');
	var uid = require("uid");
 	var crypto = require("crypto").createHash('md5');

 	var mongo = new MongoClient(url);
	var self = this;
	var uid_tries = 0;

	this.mongo = new MongoClient(url);
	this.connect = 
 	this.getUID = function(max) {
 		var id = uid(8);
 		uid_tries++;

 		return self.mongo.connect().then(function(buf) {
 			return new Promise(function(resolve, reject) {
	 			var cursor = db.collection("scripts").find({ id:id });
				cursor.each(function(err, doc) {
					if(err !== null) {
						uid_tries = 0;
						reject({ error:err, doc:doc });
					} else if(doc === null) {
						//Found a free UID, send it back
						uid_tries = 0;
						resolve({ id:id });
					} else {
						if(uid_tries >= max) {
							uid_tries = 0;
							reject({ error:"getUID: Reached max attempts, aborting", doc:doc });
						}

						self.getUID(max).then(resolve, reject);
					}
				});
			});
 		});
 	};

 	this.scriptExists = function(platform, version, code) {

 	}

 	this.saveScript = function(platform, version, script) {
	 	return self.getUID().then(function(buf) {
			 		self.mongo.connect().then(function(blob) {
			 			var now = Date.now();
			 			blob.db.collection("scripts").insertOne({
			 				id:buf.id,
			 				platform:platform,
			 				version:version,
			 				script:script,
			 				created:now
			 			}, function(err, result) {
			 				if(err) {
			 					reject({ error:err });
			 				} else {
			 					resolve({ id:buf.id, result:result });
			 				}
			 				//blob.db.close();
		 				});
					});
		 		});
 	};

 	this.getScript = function(id) {
 		return self.mongo.connect().then(function(buf) {
		 			var cursor = buf.db.collection("scripts").find({ id:id });
		 			var promise;
		 			cursor.forEach(function(doc) {
		 				console.log(doc);
		 				promise =  Promise.resolve({ doc:doc });
		 			});

		 			//buf.db.close();
		 			return promise;
		 		});
	 };
};

module.exports = ScriptManager;