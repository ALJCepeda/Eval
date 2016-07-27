define(['feeds/app'], function(appfeed) {
    var rootVM = function() {
		this.id;
        this.title = '3val';
        this.selectedTab = ko.observable('editor');
	};

    rootVM.prototype.attach = function(id) {
        this.id = id;
        ko.applyBindings(this, document.getElementById(id));
    };
    return new rootVM();
});
