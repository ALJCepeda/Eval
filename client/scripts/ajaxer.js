define([], function() {
	var Ajaxer = function() {
		var self = this;
		this.get = function(url, data, modify) {
			return self.ajax('GET', url, data, modify);
		};

		this.post = function(url, data, modify) {
			return self.ajax('POST', url, data, modify);
		};

		this.ajax  = function(method, url, data, modify) {
			var promise = new Promise(function(resolve, reject) {
				var request = new XMLHttpRequest();
				request.open(method, url);
				request.setRequestHeader("Content-Type", "application/json");
				request.onreadystatechange = function() {
					if(request.readyState === XMLHttpRequest.DONE) {
						if(request.status === 200) {
							resolve(request.responseText, request);
						} else {
							reject(request.responseText, request);
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
	};

	return Ajaxer;
});
