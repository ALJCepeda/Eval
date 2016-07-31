define(['scripts/ajaxer', 'scripts/router', 'components/documentor', 'scripts/injector', 'components/controlPanel', 'eval_shared.Project' ],
        function(ajax, Router, Documentor, Injector, ControlPanel, Project) {
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
        this.router.didGetCreate = function(platform, tag) {
            if(self.controlPanel.hasTag(platform, tag) === true) {
                self.controlPanel.selectedPlatform(platform);
                self.controlPanel.selectedTag(tag);
            } else {
                //TODO: Display error
            }
        };
    };

    Controller.prototype.initControlPanel = function(info) {
        var self = this;
        this.controlPanel = new ControlPanel(info.meta, info.themes);

        this.controlPanel.clickedSubmit = function(platform, tag, info) {
            var doc = self.documentor.getDocument(info);

            self.documentor.selectedTab('loading');

            /*
            var url = project + '/' + tag;
            //self.router.navigate(url, {trigger: true});
            */

            var project = new Project({
                platform:platform,
                tag:tag,
                documents:{
                    index:doc
                }
            });

            return ajax.compile(project).then(function(response) {
                console.log(response);
            });

            /*
            return self.app.compile(documents).then(function(response) {

                $('#stdout').html(response.stdout);
                $('#stderr').html(response.stderr);

                self.rootView.selectedTab('output');
            });*/
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

    return Controller;
});
