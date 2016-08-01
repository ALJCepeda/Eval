define(['scripts/injector', 'eval_shared.Document'], function(Injector, Document) {
    var Documentor = function() {
        var self = this;
		this.id = '';

		this.editor = '';
		this.documents = [];

        this.stdout = ko.observable('');
        this.stderr = ko.observable('');
        
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

    Documentor.prototype.setDocument = function(doc) {
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

    Documentor.prototype.setFields = function(stdout, stderr, doc) {
        this.stdout(stdout);
        this.stderr(stderr);
        this.setDocument(doc);
    };

    return Documentor;
});
