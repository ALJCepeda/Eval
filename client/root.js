define(['feeds/app'], function(appfeed) {
    var rootVM = function() {
		this.id;
        this.title = '3val';
		this.theme = ko.observableArray([]);
		this.selectedTheme = ko.observable('');

		appfeed.subscribe('fetchedThemes', function(themes) {
			this.theme(themes);
		}.bind(this));
	};

    rootVM.prototype.bind = function(id) {
        this.id = id;
        ko.applyBindings(this, document.getElementById(id));
    };

	rootVM.prototype.onSubmit = function() {
		console.log('submitted');
	};

    return new rootVM();
});
