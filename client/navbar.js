var Navbar = function() {
	var self = this;
	this.info = ko.observable({ supported:[], themes:[], precodes:{} });
	this.tabs = ko.observableArray([
		{ url:'#html', text:'Output', click: function(e) { self.selectedTab('html'); } },
		{ url:'#script', text:'Script', click: function(e) { self.selectedTab('editor'); } }
	]);
	this.selectedTab = ko.observable('editor');
	this.selectedLanguage = ko.observable();
	this.selectedVersion = ko.observable();
	this.selectedTheme = ko.observable('twilight');

	this.modeMap = {
		'nodejs':'javascript'
	};

	this.themes = ko.computed(function() {
		return self.info().themes;
	});

	this.languages = ko.computed(function() {
		return Object.keys(self.info().supported);
	});

	this.versions = ko.computed(function() {
		if(self.languages().length === 0 || !self.selectedLanguage()) { return []; }
		return self.info().supported[self.selectedLanguage()];
	});
}