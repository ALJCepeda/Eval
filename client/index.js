define(['app',
		'root',
		'scripts/controller',
		'scripts/router',
		'scripts/documentor',
		'components/createProject'],
		function(app, rootView, controller, router, documentor, createView) {
	$('.modal-trigger').leanModal({ dismissible: false });

	rootView.bind('root');
	createView.bind('createProjectView');
	documentor.bind('editor');

	controller.setDocumentor(documentor);
	controller.setRouter(router);
	controller.setRootView(rootView);
	controller.setCreateView(createView);
	controller.setApp(app);

	controller.start();
});
