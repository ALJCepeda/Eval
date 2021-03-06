define(['scripts/injector', 'bareutil.val'], function(Injector, val) {
	var ControlPanel = function(info, themes) {
		var self = this;
		this.id = '';

		/* Delegated methods provided by controller.js */
		this.clickedSubmit; //(platform, theme)
		this.changedPlatform;//(platform)
		this.changedTheme;//(theme)

		this.info = ko.observable(info);
		this.theme = ko.observableArray(themes);

		this.selectedPlatform = ko.observable('php');
		this.selectedTag = ko.observable('latest');
		this.selectedTheme = ko.observable('monokai');

		this.projectid = ko.observable('');
		this.saveid = ko.observable('');
		this.isSubmitting = ko.observable(false);
		this.showOutput = ko.observable(false);

		this.hasProject = ko.computed(function() {
			return self.projectid() !== '' && self.saveid() !== '';
		});
		this.platforms = ko.computed(function() {
			var info = self.info();
			var newPlatforms = [];

			for(var key in info) {
				var platform = { value:key, text:info[key].name };
				newPlatforms.push(platform);
			}

			return newPlatforms;
		});

		this.tags = ko.computed(function() {
			var info = self.info();
			var platform = self.selectedPlatform();

			var tags = info[platform].tags;
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
		var oldPlatform = this.selectedPlatform();
		this.selectedPlatform.subscribe(function(platform) {
			self.changedPlatform(platform, oldPlatform);
			oldPlatform = platform;
		});

		this.selectedTheme.subscribe(function(theme) {
			self.changedTheme(theme);
		});

		this.showOutput.subscribe(function(show) {
			self.shouldShowOutput(show);
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

		this.clickedSubmit(platform, tag);
	};

	ControlPanel.prototype.onClear = function() {
		var platform = this.selectedPlatform();
		var tag = this.selectedTag();

		this.clickedClear(platform, tag);
	};

	ControlPanel.prototype.hasTag = function(platform, tag) {
		var platformInfo = this.info()[platform];
		return val.object(platformInfo) && platformInfo.tags.indexOf(tag) !== -1;
	};

	ControlPanel.prototype.setFields = function(projectid, saveid, platform, tag) {
		this.projectid(projectid);
		this.saveid(saveid);

		if(val.string(platform)) {
			this.selectedPlatform(platform);
		}

		if(val.string(tag)) {
			this.selectedTag(tag);
		}
	};

	return ControlPanel;
});
