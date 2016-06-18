define(['underscore',
		'scripts/injector',
		'scripts/restful',
		'newsfeed'], function(_, injector, rest, NewsFeed) {

	var App = function() {
		this.title = '3val';
		this.rest = rest;
		this.feed = new NewsFeed();
		this.meta = '';

		this.theme = ko.observableArray([ 'terminal', 'monokai', 'twilight', 'vibrant_ink', 'github' ]);
		this.selectedTheme = ko.observable('');
	};

	App.prototype.init = function() {
		injector.injectVM('#modal_newProject', 'modals/newProject');
		this.fetchMeta();
	};

	App.prototype.fetchMeta = function() {
		this.rest.info().then(function(info) {
			console.log('Meta:', info);
			this.meta = info;
			this.feed.publish('fetchedMeta', info);
		}.bind(this));
	};

	App.prototype.platformMeta = function(platform) {
		return this.meta.project[platform] || '';
	};

	App.prototype.createProject = function(platform, tag, meta) {
		var documents = [
			{
				name:'index',
				extension:meta.extension,
				content:meta.demo
			}
		];

		var project = {
			meta:meta,
			tag:tag,
			documents:documents
		};

		this.feed.publish('didCreate', project);
		return project;
	};

	return new App();
});
