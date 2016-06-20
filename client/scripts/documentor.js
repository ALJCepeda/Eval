define(['feeds/app'], function(appfeed) {
	var Documentor = function() {
		this.id = '';
		this.editor = '';
		this.documents = [];

		appfeed.subscribe('didCreate', function(project) {
			this.loadProject(project);
		}.bind(this));
	};

	/* Initial values */
	Documentor.prototype.bind = function(id) {
		this.id = id;
		this.editor = ace.edit(id);
		this.editor.$blockScrolling = Infinity;
		this.loadMode('plain_text');
	};

	Documentor.prototype.loadProject = function(project) {
		this.loadMode(project.meta.acemode);
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
		this.editor.setTheme(theme);
	};

	return new Documentor('editor');
});
