define(['underscore', 'scripts/injector', 'newsfeed'], function(_, injector, NewsFeed) {
	var App = function() {
		this.title = '3val';
		this.feed = new NewsFeed();
		this.meta = {
			project: {
				php: {
					text:'PHP',
					aceMode:'php',
					extension:'php',
					tags: [ '5.4', '5.5', '5.6' ],
					demo: '<?php\n\techo "Hello World!";'
				}, nodejs: {
					text:'NodeJS',
					aceMode:'javascript',
					extension:'js',
					tags: [ '0.12.4' ],
					demo: 'console.log("Hello World");'
				}, haskell: {
					text:'Haskell',
					aceMode:'haskell',
					extension:'hs',
					tags: [ 'latest' ],
					demo: 'main = putStrLn "Hello World!";'
				}, pascal: {
					text:'Pascal',
					aceMode:'pascal',
					extension:'ps',
					tags: [ '2.6.4' ],
					demo: 'program Hello;\nbegin\n\twriteln (\'Hello World!\');\nend.'
				}
			}
		};
	};

	App.prototype.init = function() {
		injector.injectVM('#modal_newProject', 'modals/newProject');

		this.feed.publish('didInit', {
			ids: {
				newProject:'modal_newProject'
			}
		});

		this.feed.publish('fetchedMeta', this.meta);
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
