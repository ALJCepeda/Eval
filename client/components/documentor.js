define(['scripts/injector', 'eval_shared.Document'], function(Injector, Document) {
    var Documentor = function() {
		this.id = '';

		this.editor = '';
		this.documents = [];
        this.selectedTab = ko.observable('editor');
	};

	/* Initial values */
	Documentor.prototype.inject = function(id) {
        var self = this;
        var injector = new Injector('/');
		this.id = id;

		return injector.inject('#'+id, 'components/documentor', this).then(function() {
            self.editor = ace.edit('editor');
    		self.editor.$blockScrolling = Infinity;
    		self.editor.resize();
        });
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
