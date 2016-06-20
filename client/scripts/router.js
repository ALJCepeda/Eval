define(['newsfeed', 'feeds/app', 'modals/newProject'], function(NewsFeed, appfeed, modal_newProject) {
	var Router = function() {
		this.router = '';
		this.feed = new NewsFeed();

		var self = this;
		var BackRouter = Backbone.Router.extend({
		  	routes: {
				":action":"actionRoute",
				":id/:page":"pageRoute"
			},

		  	actionRoute: function(action) {
		  		switch(action) {
					case 'create':
						self.feed.publish('gotCreate');
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
