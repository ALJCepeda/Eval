define(['scripts/injector',
		'scripts/ajaxer',
		'newsfeed'], function(injector, ajax, NewsFeed) {

	var App = function() {
		this.id = ''
		this.feed = new NewsFeed();
		this.meta = '';
		this.themes = '';
		this.project = '';
	};

	App.prototype.compile = function(documents) {
		var project = {
			platform:this.project.platform,
			tag: this.project.tag,
			documents:documents
		};

		return ajax.compile(project);
	};

	App.prototype.fetchMeta = function() {

		return ajax.info().then(function(info) {
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

		this.project = project;
		this.feed.publish('didCreate', project);
		return project;
	};

	return new App();
});
