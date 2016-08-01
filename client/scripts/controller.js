define(['scripts/ajaxer', 'bareutil.val', 'scripts/router', 'components/documentor', 'scripts/injector', 'components/controlPanel', 'eval_shared.Project' ],
        function(ajax, val, Router, Documentor, Injector, ControlPanel, Project) {
    var Controller = function() {
        this.controlPanel;
        this.documentor;
        this.router;

        this.project = null;
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
            });
        }).then(function() {
            self.controlPanel.doSubscriptions();
            console.log('Application initialized');

            self.router.start();
        });
    };

    var projectResponse = function(response) {
        console.log('response:', response);
        if(response.status === 200) {
            return new Project(response.project);
        }
    }

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
            return ajax.project(projectid, saveid)
                        .then(projectResponse)
                        .then(function(project) {
                            self.loadProject(project);
                        });
        };
    };

    Controller.prototype.initControlPanel = function(info) {
        var self = this;
        this.controlPanel = new ControlPanel(info.meta, info.themes, this.project);

        this.controlPanel.clickedSubmit = function(platform, tag, info) {
            var promise;
            var doc = self.documentor.getDocument(info);
            self.documentor.showLoading(true);

            if(val.object(self.project) &&
                self.project.platform === platform &&
                self.project.tag === tag) {

                if(self.project.documents.index.equal(doc) === true) {
                    promise = Promise.resolve(self.project);
                } else {
                    self.project.documents.index = doc;
                    promise = ajax.compile(self.project).then(projectResponse);
                }

            } else {
                var newProj = new Project({
                    platform:platform,
                    tag:tag,
                    documents:{
                        index:doc
                    }
                });

                promise = ajax.compile(newProj).then(projectResponse);
            }


            return promise.then(function(project) {
                self.loadProject(project);

                var url = project.id + '/' + project.save.id;
                self.router.navigate(url);

                self.documentor.showLoading(false);
                self.controlPanel.showOutput(true);
                return project;
            });
        };

        this.controlPanel.changedTheme = function(theme) {
            self.documentor.setTheme(theme);
        };

        this.controlPanel.changedPlatform = function(platform, aceMode) {
            self.documentor.setMode(aceMode);
        };

        this.controlPanel.shouldShowOutput = function(show) {
            if(show === true) {
                self.documentor.selectedTab('output');
            } else {
                self.documentor.selectedTab('editor');
            }
        };
    };

    Controller.prototype.loadProject = function(project) {
        this.project = project;

        this.documentor.setFields(project.save.stdout, project.save.stderr, project.documents.index);
        this.controlPanel.setFields(project.id, project.save.id, project.platform, project.tag);

        return this.project;
    }

    Controller.prototype.initDocumentor = function() {
        this.documentor = new Documentor(this.project);
    };

    return Controller;
});
