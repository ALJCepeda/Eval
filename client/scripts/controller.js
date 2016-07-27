define([], function() {
    var Controller = function() {
        this.app;
        this.rootView;
        this.controlPanel;
        this.documentor;
        this.router;
    };

    Controller.prototype.start = function() {
        var self = this;
        this.app.fetchMeta().then(function() {
            self.router.start();

            self.controlPanel.selectedTheme('monokai');
        });
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
        var self = this;
        this.router = router;

        router.feed.subscribe('gotCreate', function() {
            self.controlPanel.open();
        });

        router.feed.subscribe('gotProject', function(args) {
            var id = args.id;
            var save = args.save;

            var didCreate = self.attemptCreateProject(id, save);
            if(didCreate === false) {
                //TODO: Attempt to fetch project from server
            }

            self.rootView.selectedTab('editor');
        });
    };

    Controller.prototype.setRootView = function(rootView) {
        var self = this;
        this.rootView = rootView;

        rootView.didSubmit = function() {
            var documents = self.documentor.getDocuments();
            self.app.compile(documents).then(function(response) {
                $('#stdout').html(response.stdout);
                $('#stderr').html(response.stderr);

                self.rootView.selectedTab('output');
            });

            self.rootView.selectedTab('loading');
        };
    };

    Controller.prototype.setControlPanel = function(controlPanel) {
        var self = this;
        this.controlPanel = controlPanel;

        controlPanel.selectedTheme.subscribe(function(theme) {
            self.documentor.setTheme(theme);
        });

        controlPanel.didSubmit = function(project, tag) {
            var url = project + '/' + tag;
            self.router.navigate(url, {trigger: true});
            return true;
        };
    };

    return new Controller();
});
