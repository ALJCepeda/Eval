define(['app',
		'scripts/router',
		'scripts/injector',
		'modals/newProject' ], function(app, router, injector, modal_newProject) {
	var editor = ace.edit('editor');
	editor.$blockScrolling = Infinity;
	editor.session.setMode('ace/mode/plain_text');
	editor.setTheme('ace/theme/monokai');

	injector.injectVM('#modal_newProject', 'modals/newProject');
	modal_newProject.id = 'modal_newProject';

	ko.applyBindings(app, document.getElementById("root"));
	$('.modal-trigger').leanModal({ dismissible: false });

	app.router = router.build();
});
