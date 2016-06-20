define(['app',
		'appcontroller',
		'scripts/router',
		'scripts/documentor',
		'modals/newProject'], function(app, controller, router, documentor, modal_newProject) {
	$('.modal-trigger').leanModal({ dismissible: false });

	app.bind('root');
	modal_newProject.bind('modal_newProject');
	documentor.bind('editor');

	controller.setDocumentor(documentor);
	controller.setRouter(router);
	controller.setNewProject(modal_newProject);
	controller.setApp(app);

	controller.start();
});
