define(['app', 'appcontroller'], function(app, controller, modal_newProject, router) {
	ko.applyBindings(app, document.getElementById("root"));
	$('.modal-trigger').leanModal({ dismissible: false });

	app.init();
});
