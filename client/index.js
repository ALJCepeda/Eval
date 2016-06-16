define(['scripts/injector'], function(Injector) {
	var editor = ace.edit('editor');
	editor.$blockScrolling = Infinity;
	editor.session.setMode('ace/mode/php');
	editor.setTheme('ace/theme/monokai');

	var injector = new Injector('/');
	injector.injectVM('#modal_newProject', 'modals/newProject').then(function(result) {
		$('#modal_newProject').openModal();
	});
});
