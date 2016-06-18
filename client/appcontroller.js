define(['app',
        'modals/newProject',
        'scripts/router'], function(app, modal_newProject, router) {
    var AppController = function() {
        debugger;
        this.app = app;
        this.newProject = modal_newProject;
        this.router = router;

        this.router.gotCreate = function() {
            this.newProject.trigger();
        }.bind(this);

        this.router.gotStart = function() {
            var fields = this.newProject.fields();
            var didCreate = this.shouldCreateProject(fields);

            if(didCreate === false) {
                setTimeout(function() {
                    this.router.navigate('create', {trigger: true});
                }.bind(this), 500);
            }
        }.bind(this);
    };

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
