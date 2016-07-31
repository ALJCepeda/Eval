define(['scripts/injector'], function(Injector) {
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
    		self.setMode('plain_text');
    		self.editor.resize();
        });
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
});
a
