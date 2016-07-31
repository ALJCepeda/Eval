define(['scripts/injector', 'bareutil.val'], function(Injector, val) {
	var ControlPanel = function() {
		var self = this;

		this.id = '';
		this.didSubmit;
		this.meta = ko.observable({});
		this.selectedPlatform = ko.observable('');
		this.selectedTag = ko.observable('');
		this.theme = ko.observableArray([]);
		this.selectedTheme = ko.observable('');

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
			var platformInfo = meta[platform];
			var newTags = [];

			if(platform === "") { return newTags; }
			if(!val.object(meta[platform])) { return {}; }

			[].push.apply(newTags, meta[platform].tags.map(function(tag) {
				return { value: tag, text: tag };
			}));

			self.selectedTag('latest');
			return newTags;
		});

		this.hooks = {};
		this.hooks.didFetchThemes = function(themes) {
			self.theme(themes);
		};
		this.hooks.didFetchMeta = function(meta) {
			self.meta(meta);
		};

		this.onSubmit = function() {
			console.log('submitted');
		};
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

	ControlPanel.prototype.inject = function(id) {
		var injector = new Injector('/');
		this.id = id;
		return injector.injectVM('#'+id, 'components/controlPanel');
	};

	ControlPanel.prototype.onSubmit = function() {
		this.didSubmit();
	};

	return ControlPanel;
});
