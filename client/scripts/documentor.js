define(['feeds/app'], function(appfeed) {
	var Documentor = function() {
		this.id = '';
		this.editor = '';
		this.documents = [];

		appfeed.subscribe('didCreate', function(project) {
			this.setMode(project.meta.acemode);
			this.setDocuments(project.documents);
		}.bind(this));
	};

	/* Initial values */
	Documentor.prototype.attach = function(id) {
		this.id = id;
		this.editor = ace.edit(id);
		this.editor.$blockScrolling = Infinity;
		this.setMode('plain_text');
	};

	Documentor.prototype.getDocuments = function() {
		var code = this.editor.getValue();
		var doc = this.documents[0];
		doc.content = code;

		return this.documents;
	};


	/* 	Later this will involve loading tabs and responding to changes by updating
		editor with tabbed content */
	Documentor.prototype.setDocuments = function(documents) {
		this.documents = documents;
		var doc = documents[0];
		this.editor.setValue(doc.content);
	};

	Documentor.prototype.setMode = function(m) {
		var mode = 'ace/mode/' + m;
		this.editor.session.setMode(mode);
	};

	Documentor.prototype.setTheme = function(t) {
		var theme = 'ace/theme/' + t;
		this.editor.setTheme(theme);
	};

	return new Documentor('editor');
});
