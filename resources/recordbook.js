var RecordBook = function() {
	var _ = require("underscore");
	var self = this;
	this.entries = { };

	this.keeper = function(domain) {
		return { 
			record:function(action, result, inform) {
				self.record(domain, action, result, inform);
			}
		};
	};

	this.record = function(domain, action, result, inform) {
		if( _.isUndefined(self.entries[domain]) ) { self.entries[domain] = {}; }
		if( _.isUndefined(self.entries[domain][action]) ) { self.entries[domain][action] = []; }

		self.entries[domain][action].push(result);

		if(inform === true || global.ISLIVE === false) {
			console.log(action + ": " + result);
		}
	};
};

module.exports = RecordBook;