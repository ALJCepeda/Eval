define([], function() {
	var Navbar = function() {
		var self = this;
		this.info = ko.observable({ supported:[], themes:[], precodes:{} });
		this.tabs = ko.observableArray([
			{ url:'#script', text:'Script', click: function(e) { self.selectedTab('editor'); } }
		]);
		this.selectedTab = ko.observable('editor');
		this.selectedPlatform = ko.observable();
		this.selectedVersion = ko.observable();
		this.selectedTheme = ko.observable('twilight');

		this.outputClicked = function(e) {
			self.selectedTab('output');
		};
		
		this.modeMap = {
			'nodejs':'javascript'
		};

		this.themes = ko.computed(function() {
			return self.info().themes;
		});

		this.platforms = ko.computed(function() {
			return Object.keys(self.info().supported);
		});

		this.versions = ko.computed(function() {
			if(self.platforms().length === 0 || !self.selectedPlatform()) { return []; }
			return self.info().supported[self.selectedPlatform()];
		});
	}

	return Navbar;	
});
