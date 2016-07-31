define(['eval_shared.Document'], function(Document) {
	var Documentor = function() {
		this.id = '';
		this.editor = '';
		this.documents = [];
	};

	/* Initial values */
	Documentor.prototype.inject = function(id) {
		this.id = id;
		this.editor = ace.edit(id);
		this.editor.$blockScrolling = Infinity;
		this.editor.resize();
		

		return Promise.resolve();
	};

	Documentor.prototype.getDocument = function(info) {
		var code = this.editor.getValue();

		return new Document({
			id:'index',
			extension:info.extension,
			content:code
		});
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

	return Documentor;
});
