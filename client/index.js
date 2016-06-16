define(['scripts/injector', 'app', 'modals/newProject'], function(Injector, app, modal_newProject) {
	var editor = ace.edit('editor');
	editor.$blockScrolling = Infinity;
	editor.session.setMode('ace/mode/plain_text');
	editor.setTheme('ace/theme/monokai');

	var injector = new Injector('/');
	injector.injectVM('#modal_newProject', 'modals/newProject');
	modal_newProject.id = 'modal_newProject';

	ko.applyBindings(app, document.getElementById("root"));

	$('.modal-trigger').leanModal({
    	dismissible: false
  	});

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
});
