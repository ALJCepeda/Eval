define(['feeds/app'], function(appfeed) {
	var Documentor = function(id) {
		var editor = ace.edit(id);

		this.id = id;
		this.editor = editor;
		this.documents = [];

		appfeed.subscribe('didInit', function() {
			this.init();
		}.bind(this));
	};

	/* Initial values */
	Documentor.prototype.init = function() {
		this.editor.$blockScrolling = Infinity;
		this.editor.session.setMode('ace/mode/plain_text');
		this.editor.setTheme('ace/theme/monokai');
	};

	Documentor.prototype.loadProject = function(project) {
		this.loadMode(project.meta.aceMode);
		this.loadDocuments(project.documents);
	};

	/* 	Later this will involve loading tabs and responding to changes by updating
		editor with tabbed content */
	Documentor.prototype.loadDocuments = function(documents) {
		this.documents = documents;
		var doc = documents[0];
		this.editor.setValue(doc.content);
	};

	Documentor.prototype.loadMode = function(m) {
		var mode = 'ace/mode/' + m;
		this.editor.session.setMode(mode);
	};

	Documentor.prototype.loadTheme = function(t) {
		var theme = 'ace/theme/' + t;
		this.editor.session.setTheme(theme);
	};

	return new Documentor('editor');
});
