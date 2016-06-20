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

        modal_newProject.didSubmit = function(project, tag) {
            var url = project + '/' + tag;
            this.router.navigate(url, {trigger: true});
            return true;
        }.bind(this);

        //this.shouldCreateProject.bind(this);
    }
    AppController.prototype.setDocumentor = function(documentor) {
        this.documentor = documentor;
    };
    AppController.prototype.setRouter = function(router) {
        this.router = router;

        router.feed.subscribe('gotCreate', function() {
            this.newProject.open();
        }.bind(this));

        router.feed.subscribe('gotProject', function(args) {
            var id = args.id;
            var save = args.save;

            var didCreate = this.attemptCreateProject(id, save);
            if(didCreate === true) {
                return true;
            }

            //TODO: Attempt to fetch project from server
        }.bind(this));
    }

    AppController.prototype.attemptCreateProject = function(platform, tag) {
		if(this.app.validPlatform(platform, tag) !== true) {
            return false;
        }

		this.app.createProject(platform, tag);
        return true;
	};

    return new AppController();
});
