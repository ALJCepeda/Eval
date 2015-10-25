var _ = require('underscore');

Object.prototype.assign = function(data) {
  	for( var key in this ) {
    	if( !_.isUndefined(data[key]) ) { this[key] = data[key]; }
  	}
};

Object.prototype.merge = function(data) {
	for( var key in data )  {
        if( _.isFunction(this[key]) ) { continue; }
		this[key] = data[key];
	}
};

Object.prototype.map = function(callback) {
	var i = 0;
	var result = {};
	for( var key in this ) {
        if( _.isFunction(this[key])) { continue; }
		var mod = callback(key, this[key], i);
		if( _.isObject(mod) && !_.isArray(mod) ) {
			result.merge(mod);
		} else {
			result[key] = mod;
		}
		i++;
	}

	return result;
};