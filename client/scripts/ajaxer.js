define([], function() {
	var Ajaxer = function() { };

	Ajaxer.prototype.info = function() {
        return this.get('info').then(function(data) {
            var info = JSON.parse(data);
            return info;
        });
    };

    Ajaxer.prototype.compile = function(data) {
        return this.post('compile', data);
    }

	Ajaxer.prototype.get = function(url, data, modify) {
		return this.ajax('GET', url, data, modify);
	};

	Ajaxer.prototype.post = function(url, data, modify) {
		return this.ajax('POST', url, data, modify);
	};

	Ajaxer.prototype.ajax  = function(method, url, data, modify) {
		var promise = new Promise(function(resolve, reject) {
			var request = new XMLHttpRequest();
			request.open(method, url);
			request.setRequestHeader("Content-Type", "application/json");
			request.onreadystatechange = function() {
				if(request.readyState === XMLHttpRequest.DONE) {
					if(request.status === 200) {
						resolve(request.responseText);
					} else {
						reject(request);
					}
				}
			};

			if(typeof modify !== 'undefined') {
				modify(request, data);
			}

			var json = JSON.stringify(data);
			request.send(json);
		});

		return promise;
	};

	return Ajaxer;
});
