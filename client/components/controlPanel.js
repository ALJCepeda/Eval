define(['feeds/app', 'scripts/injector'], function(appfeed, injector) {
	var ControlPanel = function() {
		var self = this;

		this.id = '';
		this.didSubmit;
		this.meta = ko.observable({});
		this.selectedPlatform = ko.observable('');
		this.selectedTag = ko.observable('');
		this.theme = ko.observableArray([]);
		this.selectedTheme = ko.observable('');

		appfeed.subscribe('fetchedThemes', function(themes) {
			self.theme(themes);
		});

        var self = this;
        this.clickedTheme = function(theme) {
            self.selectedTheme(theme);
        };

		this.disabled = ko.computed(function() {
			return self.selectedPlatform() === '' || self.selectedTag() === '';
		});

		this.platforms = ko.computed(function() {
			var meta = self.meta();
			var newPlatforms = [];

			for(var key in meta) {
				var platform = { value:key, text:meta[key].name };
				newPlatforms.push(platform);
			}

			return newPlatforms;
		});

		this.tags = ko.computed(function() {
			var meta = self.meta();
			var platform = self.selectedPlatform();
			var tags = [];

			if(platform === "") { return tags; }
			
			[].push.apply(tags, meta[platform].tags.map(function(tag) {
				return { value: tag, text: tag };
			}));

			self.selectedTag('');
			return tags;
		});

		appfeed.subscribe('fetchedMeta', function(meta) {
			self.meta(meta);
		});
	};

	ControlPanel.prototype.onClick = function() {
		if(this.disabled() === false) {
			var platform = this.selectedPlatform();
			var tag = this.selectedTag();

			var shouldDismiss = this.didSubmit(platform, tag);
			if(shouldDismiss === true) {
				this.close();
			}
		}
	};

	ControlPanel.prototype.attach = function(id) {
		this.id = id;
		injector.injectVM('#'+id, 'components/controlPanel');
	};
	ControlPanel.prototype.setPlatformDisable = function(option, platform) {
		ko.applyBindingsToNode(option, {disable: platform.disable}, platform);
	};

	ControlPanel.prototype.setTagDisable = function(option, version) {
		ko.applyBindingsToNode(option, {disable: version.disable}, version);
	};

	ControlPanel.prototype.onSubmit = function() {
		this.didSubmit();
	};

	return new ControlPanel();
});
