define(['app',
		'root',
		'scripts/controller',
		'scripts/router',
		'scripts/documentor',
		'components/controlPanel'],
		function(app, rootView, controller, router, documentor, controlPanel) {
	$.material.init();

	rootView.attach('root');
	controlPanel.attach('controlPanelView');
	documentor.attach('editor');

	controller.setDocumentor(documentor);
	controller.setRootView(rootView);
	controller.setControlPanel(controlPanel);

	controller.setRouter(router);
	controller.setApp(app);

	controller.start();
});
