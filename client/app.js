define(['underscore'], function(_) {
	var App = function() {
		this.title = '3val';
		this.router = '';
		this.meta = {
			project: {
				php: { text:'PHP', tags: [ '5.4', '5.5', '5.6' ] },
				nodejs: { text:'NodeJS', tags: [ '0.12.4' ] },
				haskell: { text:'Haskell', tags: [ 'latest' ] },
				pascal: { text:'Pascal', tags: [ '2.6.4' ] }
			}
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

			var project = {
				platform:platform,
				tag:tag,
				documents: [
					{
						name:'index',
						extension:'php',
						content:'<?php\n\techo "Hello World!";'
					}
				]
			};

			this.project(project);
			return project;
		};
	};

	return new App();
});
