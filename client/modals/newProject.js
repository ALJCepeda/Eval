define(['feeds/app', 'scripts/injector'], function(appfeed, injector) {
	var NewProject = function() {
		var self = this;
		var firstPlatform = { value: '', text: 'Choose your platform', disable:true };
		var firstTag = { value: '', text: 'Choose your version', disable:true };

		this.id = '';
		this.didSubmit;
		this.meta = ko.observable({});
		this.selectedPlatform = ko.observable('');
		this.selectedTag = ko.observable('');

		this.disabled = ko.computed(function() {
			return this.selectedPlatform() === '' ||
					this.selectedTag() === ''
		}.bind(this));

		this.platforms = ko.computed(function() {
			var meta = this.meta();
			var newPlatforms = [ firstPlatform ];

			for(var key in meta) {
				var platform = { value:key, text:meta[key].name, disable:false };
				newPlatforms.push(platform);
			}

			return newPlatforms;
		}.bind(this));

		this.tags = ko.computed(function() {
			var meta = this.meta();
			var platform = this.selectedPlatform();
			var tags = [ firstTag ];

			if(platform === "") { return tags; }

			[].push.apply(tags, meta[platform].tags.map(function(tag) {
				return { value: tag, text: tag, disable: false };
			}));

			this.selectedTag('');
			setTimeout(function() {
				$('#selectVersion').material_select();
			});

			return tags;
		}.bind(this));

		appfeed.subscribe('fetchedMeta', function(meta) {
			this.meta(meta);
		}.bind(this));
	};

	NewProject.prototype.onClick = function() {
		if(this.disabled() === false) {
			var platform = this.selectedPlatform();
			var tag = this.selectedTag();

			var shouldDismiss = this.didSubmit(platform, tag);
			if(shouldDismiss === true) {
				this.close();
			}
		}
	};

	NewProject.prototype.bind = function(id) {
		this.id = id;
		injector.injectVM('#'+id, 'modals/newProject');
	};
	NewProject.prototype.setPlatformDisable = function(option, platform) {
		ko.applyBindingsToNode(option, {disable: platform.disable}, platform);
	};

	NewProject.prototype.setTagDisable = function(option, version) {
		ko.applyBindingsToNode(option, {disable: version.disable}, version);
	};

	NewProject.prototype.fields = function() {
		var platform = this.selectedPlatform();
		var tag = this.selectedTag();

		return {
			platform:platform,
			tag:tag
		};
	};

	NewProject.prototype.open = function() {
		$('#open_'+this.id).trigger('click');
	};
	NewProject.prototype.close = function() {
		$('#close_'+this.id).trigger('click');
	};

	NewProject.prototype.didRender = function(element) {
		element.className += ' modal';
		element.style.visibility = 'visible';
		$('select').material_select();
	};

	return new NewProject();
});
