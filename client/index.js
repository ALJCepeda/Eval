define(['app', 'modals/newProject', 'scripts/router'], function(app, modal_newProject, router) {
	ko.applyBindings(app, document.getElementById("root"));
	$('.modal-trigger').leanModal({ dismissible: false });

	app.init();
});
