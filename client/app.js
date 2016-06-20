define(['underscore',
		'scripts/injector',
		'scripts/restful',
		'newsfeed'], function(_, injector, rest, NewsFeed) {

	var App = function() {
		this.id;
		this.title = '3val';
		this.rest = rest;
		this.feed = new NewsFeed();
		this.meta = '';

		this.theme = ko.observableArray([ 'terminal', 'monokai', 'twilight', 'vibrant_ink', 'github' ]);
		this.selectedTheme = ko.observable('');
	};

	App.prototype.bind = function(id) {
		this.id = id;
		ko.applyBindings(this, document.getElementById(id));
	};

	App.prototype.fetchMeta = function() {
		return this.rest.info().then(function(info) {
			console.log('Meta:', info);
			this.meta = info.meta;
			this.theme(info.themes);

			this.feed.publish('fetchedMeta', info.meta);
		}.bind(this));
	};

	App.prototype.platformMeta = function(platform) {
		return this.meta[platform] || '';
	};

	App.prototype.validPlatform = function(platform, tag) {
		var meta = this.platformMeta(platform);

		if(meta === '') {
			return false;
		}

		return meta.tags.indexOf(tag) !== -1;
	};

	App.prototype.createProject = function(platform, tag) {
		var meta = this.platformMeta(platform);

		var project = {
			meta:meta,
			tag:tag,
			documents:meta.demo
		};

		this.feed.publish('didCreate', project);
		return project;
	};

	return new App();
});
