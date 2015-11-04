var MongoStore = function(url) {
	var MongoClient = require('./mongoclient.js');

	var self = this;
	this.mongo = new MongoClient(url);
	this.url = url;

	this.on = function(action, cb) {
		console.log(action);
	};

	
	this.all = function(cb) {
		self.mongo.connect().then(function(buf) {
			var sessions = [];
			var cursor = buf.db.collection('sessions').find();
			cursor.each(function(err, doc) {
				if(err) { return cb(error, session); }
				sessions.push(doc);
			});

			return cb(null, sessions);
		});
	};

	this.destroy = function(sid, cb) {
		self.mongo.connect().then(function(buf) {
			buf.db.collection('sessions').deleteOne({ sid:sid },
				function( error, results ) {
					return cb(error);
			});
		});
	};

	this.clear = function(cb) {
		self.mongo.connect().then(function(buf) {
			buf.db.collection('sessions').deleteMany({},
				function( error, results ) {
					return cb(error);
			});
		});
	};

	this.length = function(cb) {
		self.mongo.connect().then(function(buf) {
			var count = buf.db.collection('sessions').count();
			return cb(null, count);
		});
	};

	this.get = function(sid, cb) {
		self.mongo.connect().then(function(buf) {
			var result;
			var cursor = buf.db.collection('sessions').find({ sid:sid });
			cursor.each(function(err, doc) {
				if(err) { return cb(err, doc); }
				result = doc;
			})

			return cb(null, result);
		});
	};

	this.set = function(sid, session, cb) {
		self.mongo.connect().then(function(buf) {
			buf.db.collection('sessions').update(
				{ sid:sid }, 
				session, 
				{ upsert:true }
			);

			return cb(null);
		});
	};
};

module.exports = MongoStore;