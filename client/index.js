define(['app',
		'root',
		'scripts/controller',
		'scripts/router',
		'scripts/documentor',
		'components/createProject'],
		function(app, rootView, controller, router, documentor, createView) {
	$('.modal-trigger').leanModal({ dismissible: false });

	rootView.attach('root');
	createView.attach('createProjectView');
	documentor.attach('editor');

	controller.setDocumentor(documentor);
	controller.setRootView(rootView);
	controller.setCreateView(createView);

	controller.setRouter(router);
	controller.setApp(app);

	controller.start();
});
