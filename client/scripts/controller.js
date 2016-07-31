define(['scripts/ajaxer', 'scripts/router', 'scripts/documentor', 'scripts/injector', 'components/controlPanel' ],
        function(ajax, Router, Documentor, Injector, ControlPanel) {
    var Controller = function() {
        this.controlPanel;
        this.documentor;
        this.router;
    };

    Controller.prototype.appStarted = function() {
        var self = this;

        return ajax.fetchMeta().then(function(info) {
            console.log('Fetched info:', info)
            self.initRouter();
            self.initControlPanel(info);
            self.initDocumentor();

            return self.documentor.inject('documentorView').then(function() {
                return self.controlPanel.inject('controlPanelView');
            }).then(function() {
                self.controlPanel.doSubscriptions();
                self.router.start();
            });
        });
    };

    Controller.prototype.initRouter = function() {
        var self = this;
        this.router = new Router();
        this.router.gotProject = function() {
            var id = args.id;
            var save = args.save;

            var didCreate = self.attemptCreateProject(id, save);
            if(didCreate === false) {
                //TODO: Attempt to fetch project from server
            }

            //self.rootView.selectedTab('editor');
        };
    };

    Controller.prototype.initControlPanel = function(info) {
        var self = this;
        this.controlPanel = new ControlPanel(info.meta, info.themes);

        this.controlPanel.clickedSubmit = function(project, tag) {
            var documents = self.documentor.getDocuments();

            debugger;
            self.rootView.selectedTab('loading');
            var url = project + '/' + tag;
            self.router.navigate(url, {trigger: true});

            return self.app.compile(documents).then(function(response) {
                $('#stdout').html(response.stdout);
                $('#stderr').html(response.stderr);

                self.rootView.selectedTab('output');
            });
        };

        this.controlPanel.changedTheme = function(theme) {
            self.documentor.setTheme(theme);
        };

        this.controlPanel.changedPlatform = function(platform, aceMode) {
            self.documentor.setMode(aceMode);
        };
    };

    Controller.prototype.initDocumentor = function() {
        this.documentor = new Documentor();
    };

    Controller.prototype.attemptCreateProject = function(platform, tag) {
		if(this.app.validPlatform(platform, tag) !== true) {
            return false;
        }

		this.app.createProject(platform, tag);
        return true;
	};

    return Controller;
});
