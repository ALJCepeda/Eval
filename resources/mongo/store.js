var MongoStore = function(url) {
	var self = this;
	var MongoClient = require("./client.js");

	this.mongo = new MongoClient(url);
	this.on = function(action, cb) {
		console.log(action);
	};

	this.all = function(cb) {
		self.mongo.database().then(function(db) {
			var coll = db.collection("sessions");

			var sessions = [];
			coll.find().each(function(error, doc) {
				if(error) {
					db.close();
					cb(error, null); 
				}

				if(doc !== null) {
					sessions.push(doc);
				} else {
					db.close();
					cb(null, sessions);
				}
			});
		}).catch(function(error) {
			cb(error);
		});
	};

	this.destroy = function(sid, cb) {
		self.mongo.database().then(function(db) {
			var coll = db.collection("sessions");

			coll.deleteOne({ sid:sid },
				function(error) {
					db.close();
					cb(error);
			});
		}).catch(function(error) {
			cb(error);
		});
	};

	this.clear = function(cb) {
		self.mongo.database().then(function(db) {
			var coll = db.collection("sessions");

			coll.deleteMany({},
				function( error ) {
					db.close();
					cb(error);
			});
		}).catch(function(error) {
			cb(error);
		});
	};

	this.length = function(cb) {
		self.mongo.database().then(function(db) {
			var coll = db.collection("sessions");

			coll.count(function(error, count) {
				db.close();
				cb(error, count);
			});
		}).catch(function(error) {
			cb(error);
		});
	};

	this.get = function(sid, cb) {
		self.mongo.database().then(function(db) {
			var coll = db.collection("sessions");

			coll.find({ sid:sid }).nextObject(function(error, doc) {
				db.close();
				cb(error, doc);
			});
		}).catch(function(error) {
			cb(error);
		});
	};

	this.set = function(sid, session, cb) {
		self.mongo.database().then(function(db) {
			var coll = db.collection("sessions");
			coll.update(
				{ sid:sid }, session, { upsert:true },
				function(error) {
					cb(error);
				}
			);
		}).catch(function(error) {
			cb(error);
		});
	};
};

module.exports = MongoStore;