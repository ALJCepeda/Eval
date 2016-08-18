define([ 'scripts/ajaxer' ], function(ajax) {
	var Injector = function(base) {
		this.base = base;
	};

	Injector.prototype.injectHTML = function(selector, html) {
		var element = document.querySelector(selector);
		element.innerHTML = html;

		return element;
	};

	Injector.prototype.injectView = function(selector, view) {
		var url = view + '.html';
		if(this.base !== '/') {
			url = this.base + '/' + url;
		}

		return ajax.get(url).then(function(html) {
		 	return this.injectHTML(selector, html);
		}.bind(this));
	};

	Injector.prototype.inject = function(selector, view, model) {
		var promise = this.injectView(selector, view);

		if(typeof model !== 'undefined') {
			promise = promise.then(function(element) {
				ko.applyBindings(model, element);

				if(typeof model.didRender !== 'undefined') {
					model.didRender(element);
				}

				return element;
			});
		}

		return promise;
	};

	Injector.prototype.injectVM = function(selector, path) {
		return this.injectView(selector, path).then(function(element) {
			return new Promise(function(resolve, reject) {
				try {
					require([path], function(model) {
						ko.applyBindings(model, element);

						if(typeof model.didRender !== 'undefined') {
							model.didRender(element);
						}

						resolve({
							model:model,
							element:element
						});
					});
				} catch(err) {
					reject(err);
				}
			});
		});
	};

	return Injector;
});
