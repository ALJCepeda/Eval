define(['scripts/injector', 'bareutil.val'], function(Injector, val) {
	var ControlPanel = function(meta, themes) {
		var self = this;
		this.id = '';

		/* Delegated methods provided by controller.js */
		this.clickedSubmit; //(platform, theme)
		this.changedPlatform;//(platform)
		this.changedTheme;//(theme)

		this.meta = ko.observable(meta);
		this.theme = ko.observableArray(themes);

		this.selectedPlatform = ko.observable('php');
		this.selectedTag = ko.observable('latest');
		this.selectedTheme = ko.observable('monokai');

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
			console.log("PLATFORM:", platform);
			var tags = meta[platform].tags;
			var newTags = [];

			[].push.apply(newTags, tags.map(function(tag) {
				return { value: tag, text: tag };
			}));

			self.selectedTag(tags[0]);
			return newTags;
		});
	};

	/*
		Knockout calls computed observers as soon as they're created but not subscribers
		In order to avoid unnecessary checks on updates we defer subscription creation and force updates
	*/

	ControlPanel.prototype.doSubscriptions = function() {
		var self = this;
		this.selectedPlatform.subscribe(function(platform) {
			var platformInfo = self.meta()[platform];
			var aceMode = platformInfo.aceMode;

			self.changedPlatform(platform, aceMode);
		});

		this.selectedTheme.subscribe(function(theme) {
			self.changedTheme(theme);
		});

		this.selectedPlatform.valueHasMutated();
		this.selectedTheme.valueHasMutated();
	};

	ControlPanel.prototype.inject = function(id) {
		var injector = new Injector('/');
		this.id = id;
		return injector.inject('#'+id, 'components/controlPanel', this);
	};

	ControlPanel.prototype.onSubmit = function() {
		var platform = this.selectedPlatform();
		var tag = this.selectedTag();
		var info = this.meta()[platform];

		this.clickedSubmit(platform, tag, info);
	};

	ControlPanel.prototype.hasTag = function(platform, tag) {
		var platformInfo = this.meta()[platform];
		return val.defined(platformInfo) && platformInfo.tags.indexOf(tag) !== -1;
	};
	return ControlPanel;
});
