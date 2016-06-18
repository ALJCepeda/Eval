define(['feeds/app', 'modals/newProject'], function(appfeed, modal_newProject) {
	var Router = function() {
		appfeed.subscribe('didInit', function() {
			modal_newProject.didPressSubmit = function(platform, tag) {
				var willCreate = app.shouldCreateProject(platform, tag);
				if(willCreate === false) {
					setTimeout(function() {
						app.shouldNavigate('create', {trigger: true});
					}.bind(this), 500);
				}
			};

			var BackRouter = Backbone.Router.extend({
			  	routes: {
					":action":"actionRoute",
					":id/:page":"pageRoute"
				},

			  	actionRoute: function(action) {
			  		switch(action) {
						case 'create':
							modal_newProject.trigger();
						break;

						case 'start':
							modal_newProject.submit();
						break;

						case 'settings':

						break;
					}
			  	},

			  	pageRoute: function(id, page) {

			  	}
			});

			var router = new BackRouter();
			Backbone.history.start();
			return router;
		});
	};

	return new Router();
});
