define(['underscore'], function(_) {
	var App = function() {
		debugger;
		this.title = '3val';
		this.router = '';
		this.documentor = '';
		this.meta = {
			project: {
				php: {
					text:'PHP',
					aceMode:'php',
					tags: [ '5.4', '5.5', '5.6' ],
				}, nodejs: {
					text:'NodeJS',
					aceMode:'javascript',
					tags: [ '0.12.4' ]
				}, haskell: {
					text:'Haskell',
					aceMode:'haskell',
					tags: [ 'latest' ]
				}, pascal: {
					text:'Pascal',
					aceMode:'pascal',
					tags: [ '2.6.4' ]
				}
			}
		};

		this.platformMeta = function(platform) {
			return this.meta.project[platform];
		};

		this.project = ko.observable({
			platform:'',
			tag:'',
			documents: []
		});

		this.createProject = function(platform, tag) {
			if( platform === '' || tag === '') {
				return false;
			}

			var meta = this.platformMeta(platform);
			var documents = [
				{
					name:'index',
					extension:'php',
					content:'<?php\n\techo "Hello World!";'
				}
			];

			var project = {
				meta:meta,
				tag:tag,
				documents:documents
			};

			this.project(project);
			this.documentor.loadProject(project);

			return project;
		};
	};

	return new App();
});
