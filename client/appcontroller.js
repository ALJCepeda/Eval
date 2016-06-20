define([], function() {
    var AppController = function() {
        this.app;
        this.newProject;
        this.documentor;
        this.router;
    };

    AppController.prototype.start = function() {
        this.app.fetchMeta();
        this.app.selectedTheme('monokai');
    };

    AppController.prototype.setApp = function(app) {
        this.app = app;

        app.selectedTheme.subscribe(function(theme) {
            this.documentor.loadTheme(theme);
        }.bind(this));
    };
    AppController.prototype.setNewProject = function(modal_newProject) {
        this.newProject = modal_newProject;
    }
    AppController.prototype.setDocumentor = function(documentor) {
        this.documentor = documentor;
    };
    AppController.prototype.setRouter = function(router) {
        this.router = router;

        router.feed.subscribe('gotCreate', function() {
            this.newProject.trigger();
        }.bind(this));

        router.feed.subscribe('gotStart', function(fields) {
            var didCreate = this.shouldCreateProject(fields);

            if(didCreate === false) {
                setTimeout(function() {
                    this.router.navigate('create', {trigger: true});
                }.bind(this), 500);
            }
        }.bind(this));
    }

    AppController.prototype.shouldCreateProject = function(options) {
        var platform = options.platform;
        var tag = options.tag;
		var meta = this.app.platformMeta(platform);

		if( platform === '' || tag === '' || meta === '') {
			return false;
		}

		return this.app.createProject(platform, tag, meta);
	};

    return new AppController();
});
