define(['feeds/app', 'modals/newProject'], function(appfeed, modal_newProject) {
	var Router = function() {
		var self = this;
		this.router = '';
		this.gotCreate = function() { console.log('#create'); };
		this.gotStart = function() { console.log('#start'); };
		this.gotSettings = function() { console.log('#settings'); };

		var BackRouter = Backbone.Router.extend({
		  	routes: {
				":action":"actionRoute",
				":id/:page":"pageRoute"
			},

		  	actionRoute: function(action) {
		  		switch(action) {
					case 'create':
						self.gotCreate();
					break;

					case 'start':
						self.gotStart();
					break;

					case 'settings':
						self.gotSettings();
					break;
				}
		  	},

		  	pageRoute: function(id, page) {

		  	}
		});

		this.router = new BackRouter();
		Backbone.history.start();
	};

	Router.prototype.navigate = function(route, options) {
		this.router.navigate(route, options);
	};

	return new Router();
});
