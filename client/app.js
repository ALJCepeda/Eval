define(['scripts/injector',
		'scripts/ajaxer',
		'newsfeed'], function(injector, ajax, NewsFeed) {

	var App = function() {
		this.controller;
		this.feed = new NewsFeed();
		this.meta = '';
		this.themes = '';
		this.project = '';
	};

	App.prototype.start = function() {
		$.material.init();
		this.controller.appStarted().then(function() {
			console.log('Application initialized');
		});
	};

	App.prototype.compile = function(documents) {
		var project = {
			platform:this.project.platform,
			tag: this.project.tag,
			documents:documents
		};

		return ajax.compile(project);
	};

	App.prototype.platformMeta = function(platform) {
		return this.meta[platform] || '';
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

	return App;
});
