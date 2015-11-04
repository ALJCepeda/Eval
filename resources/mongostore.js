var MongoStore = function(url) {
	var self = this;
	var MongoClient = require("mongodb").MongoClient;
	var Promise = require("promise");

	this.url = url;

	this.on = function(action, cb) {
		console.log(action);
	};

	this.connect = function(cb) {
		MongoClient.connect(self.url, function(err, db) {
			return cb(err, db);
		});
	}
	this.all = function(cb) {
		self.connect(function(error, db) {
			if(error) { return cb(error); }

			var sessions = [];
			var cursor = db.collection('sessions').find();
			cursor.each(function(err, doc) {
				error = err;
				sessions.push(doc);
			});

			return cb(error, sessions);
		});
	};

	this.destroy = function(sid, cb) {
		self.connect(function(error, db) {
			if(error) { return cb(error); }

			db.collection('sessions').deleteOne({ sid:sid },
				function( error, results ) {
					return cb(error);
			});
		});
	};

	this.clear = function(cb) {
		self.connect(function(error, db) {
			if(error) { return cb(error); }

			db.collection('sessions').deleteMany({},
				function( error, results ) {
					return cb(error);
			});
		})
	};

	this.length = function(cb) {
		self.connect(function(error, db) {
			if(error) { return cb(error); }
			var count = db.collection('sessions').count();
			return cb(error, count);
		});
	};

	this.get = function(sid, cb) {
		self.connect(function(error, db) {
			if(error) { return cb(error); }

			var result;
			var cursor = db.collection('sessions').find({ sid:sid });
			cursor.each(function(err, doc) {
				error = err;
				result = doc;
			})

			return cb(error, result);
		});
	};

	this.set = function(sid, session, cb) {
		self.connect(function(error, db) {
			if(error) { return cb(error); }
			db.collection('sessions').update(
				{ sid:sid }, 
				session, 
				{ upsert:true }
			);

			return cb(error);
		});
	};
};

module.exports = MongoStore;