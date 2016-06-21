define(['underscore',
		'scripts/injector',
		'scripts/restful',
		'newsfeed'], function(_, injector, rest, NewsFeed) {

	var App = function() {
		this.id = ''
		this.rest = rest;
		this.feed = new NewsFeed();
		this.meta = '';
		this.themes = '';
	};

	App.prototype.fetchMeta = function() {
		return this.rest.info().then(function(info) {
			console.log('Meta:', info);

			this.meta = info.meta;
			this.feed.publish('fetchedMeta', info.meta);

			this.themes = info.themes;
			this.feed.publish('fetchedThemes', info.themes);
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
			platform:platform,
			tag:tag,
			documents:meta.demo
		};

		this.feed.publish('didCreate', project);
		return project;
	};

	return new App();
});
