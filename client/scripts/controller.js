define(['scripts/ajaxer', 'scripts/router', 'components/documentor', 'scripts/injector', 'components/controlPanel', 'eval_shared.Project' ],
        function(ajax, Router, Documentor, Injector, ControlPanel, Project) {
    var Controller = function() {
        this.controlPanel;
        this.documentor;
        this.router;
    };

    Controller.prototype.start = function() {
        $.material.init();
        var self = this;

        return ajax.fetchMeta().then(function(info) {
            console.log('Info:', info)
            self.initRouter();
            self.initControlPanel(info);
            self.initDocumentor();

            return self.documentor.inject('documentorView').then(function() {
                return self.controlPanel.inject('controlPanelView');
            }).then(function() {
                self.controlPanel.doSubscriptions();
                console.log('Application initialized');

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

        this.router.didGetProject = function(projectid, saveid) {
            return ajax.project(projectid, saveid).then(function(response) {
                console.log('didGetProject:', response);
                if(response.status === 200) {
                    var project = new Project(response.project);
                    self.controlPanel.setProject(project.id, project.save.id, project.platform, project.tag);
                    self.documentor.setDocument(project.documents.index);
                }
            });
        };
    };

    Controller.prototype.initControlPanel = function(info) {
        var self = this;
        this.controlPanel = new ControlPanel(info.meta, info.themes);

        this.controlPanel.clickedSubmit = function(platform, tag, info) {
            var doc = self.documentor.getDocument(info);

            self.documentor.selectedTab('loading');

            var curProj = new Project({
                platform:platform,
                tag:tag,
                documents:{
                    index:doc
                }
            });

            return ajax.compile(curProj).then(function(response) {
                if(response.status === 200) {
                    console.info("Response:", response);
                    var resProj = new Project(response.project);

                    var url = resProj.id + '/' + resProj.save.id;
                    self.router.navigate(url);

                    self.documentor.stdout(resProj.save.stdout);
                    self.documentor.stderr(resProj.save.stderr);

                    self.documentor.selectedTab('output');
                }
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

    return Controller;
});
