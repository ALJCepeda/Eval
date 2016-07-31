define(['newsfeed'], function() {
	var Router = function() {
		this.backRouter = '';
		this.didGetProject;
		this.didGetCreate;
	};

	Router.prototype.start = function() {
		var self = this;
		var BackRouter = Backbone.Router.extend({
		  	routes: {
				":projectid/:saveid":"idRoute",
				"create/:platform/:tag":"createRoute"
			},

		  	idRoute: function(projectid, saveid) {
				self.didGetProject(projectid, saveid);
		  	},

			createRoute: function(platform, tag) {
				self.didGetCreate(platform, tag);
			}
		});

		this.backRouter = new BackRouter();
		Backbone.history.start();
	}

	Router.prototype.navigate = function(route, options) {
		this.backRouter.navigate(route, options);
	};

	return Router;
});
