define(['scripts/ajaxer', 'scripts/router', 'scripts/documentor', 'scripts/injector', 'components/controlPanel' ],
        function(ajax, Router, Documentor, Injector, ControlPanel) {
    var Controller = function() {
        this.controlPanel;
        this.documentor;
        this.router;
    };

    Controller.prototype.appStarted = function() {
        var self = this;

        this.router = new Router();
        this.documentor = new Documentor();
        this.controlPanel = new ControlPanel();

        this.router.gotProject = function() {
            var id = args.id;
            var save = args.save;

            var didCreate = self.attemptCreateProject(id, save);
            if(didCreate === false) {
                //TODO: Attempt to fetch project from server
            }

            //self.rootView.selectedTab('editor');
        };

        this.controlPanel.shouldSubmit = function(project, tag) {
            var documents = self.documentor.getDocuments();

            self.rootView.selectedTab('loading');
            var url = project + '/' + tag;
            self.router.navigate(url, {trigger: true});

            return self.app.compile(documents).then(function(response) {
                $('#stdout').html(response.stdout);
                $('#stderr').html(response.stderr);

                self.rootView.selectedTab('output');
            });
        };

        this.controlPanel.changedTheme = function(newTheme) {
            self.documentor.setTheme(newTheme);
        };

        return this.controlPanel.inject('controlPanelView').then(function() {
            return self.documentor.inject('documentorView');
        }).then(function() {
            return ajax.fetchMeta();
        }).then(function(info) {
            self.router.start();
            self.controlPanel.hooks.didFetchMeta(info.meta);
            self.controlPanel.hooks.didFetchThemes(info.themes);

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

    return new Controller();
});
