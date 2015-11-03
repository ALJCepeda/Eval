define(['resources/dataaccess', 'components/navbar', 'resources/controller'], function(DataAccess, Navbar, Controller) {
	var nav = new Navbar();
	var da = new DataAccess();
	var editor = ace.edit("editor");
	var controller = new Controller(da, nav, editor);

	ko.applyBindings(nav);
	controller.initialize();

	var Router = Backbone.Router.extend({
	  	routes: {
			':id':'idRoute',
			':id/:page':'pageRoute'
		},
	  	
	  	idRoute: function(id) {
	  		da.getScript(id).then(function(data) {
	  			if(!_.isUndefined(data.error)) {
	  				console.log("Unabled to find script with id: " + id);
	  			}

	  			nav.selectedPlatform(data.platform);
	  			nav.selectedVersion(data.version);
	  			debugger;
	  			editor.session.getDocument().setValue(data.script);
	  		});
	  	},

	  	pageRoute: function(id, page) {

	  	}
	});

	var router = new Router();
	Backbone.history.start();
});
