define(['feeds/app'], function(appfeed) {
    var rootVM = function() {
		this.id;
        this.title = '3val';
		this.theme = ko.observableArray([]);
		this.selectedTheme = ko.observable('');
        this.selectedTab = ko.observable('editor');
        this.didSubmit;

		appfeed.subscribe('fetchedThemes', function(themes) {
			this.theme(themes);
		}.bind(this));

        var self = this;
        this.clickedTheme = function(theme) {
            self.selectedTheme(theme);
        };
	};

    rootVM.prototype.attach = function(id) {
        this.id = id;
        ko.applyBindings(this, document.getElementById(id));
    };

	rootVM.prototype.onSubmit = function() {
		this.didSubmit();
	};
    return new rootVM();
});
