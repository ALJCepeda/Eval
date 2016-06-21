define([], function() {
    var Controller = function() {
        this.app;
        this.rootView;
        this.createView;
        this.documentor;
        this.router;
    };

    Controller.prototype.start = function() {
        this.app.fetchMeta().then(function() {
            this.router.start();

            this.rootView.selectedTheme('monokai');
        }.bind(this));
    };

    Controller.prototype.attemptCreateProject = function(platform, tag) {
		if(this.app.validPlatform(platform, tag) !== true) {
            return false;
        }

		this.app.createProject(platform, tag);
        return true;
	};

    Controller.prototype.setApp = function(app) {
        this.app = app;
    };

    Controller.prototype.setDocumentor = function(documentor) {
        this.documentor = documentor;
    };

    Controller.prototype.setRouter = function(router) {
        this.router = router;

        router.feed.subscribe('gotCreate', function() {
            this.createView.open();
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
    };

    Controller.prototype.setRootView = function(rootView) {
        this.rootView = rootView;

        rootView.selectedTheme.subscribe(function(theme) {
            this.documentor.loadTheme(theme);
        }.bind(this));
    };

    Controller.prototype.setCreateView = function(createView) {
        this.createView = createView;

        createView.didSubmit = function(project, tag) {
            var url = project + '/' + tag;
            this.router.navigate(url, {trigger: true});
            return true;
        }.bind(this);
    };

    return new Controller();
});
