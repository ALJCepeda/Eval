defined([], function() {
	var Router = Backbone.Router.extend({
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

				break;

				case 'settings':

				break;
			}
	  	},

	  	pageRoute: function(id, page) {

	  	}
	});

	var router = new Router();
	Backbone.history.start();
	return router;
});
