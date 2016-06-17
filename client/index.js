define(['app',
		'scripts/injector',
		'scripts/documentor',
	 	'scripts/router' ], function(app, injector, Documentor, router) {
	app.documentor = new Documentor('editor');
	app.documentor.init();

	ko.applyBindings(app, document.getElementById("root"));
	$('.modal-trigger').leanModal({ dismissible: false });

	app.router = router.init();
});
