define(['feeds/app', 'scripts/injector'], function(appfeed, injector) {
	var CreateProject = function() {
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

	CreateProject.prototype.onClick = function() {
		if(this.disabled() === false) {
			var platform = this.selectedPlatform();
			var tag = this.selectedTag();

			var shouldDismiss = this.didSubmit(platform, tag);
			if(shouldDismiss === true) {
				this.close();
			}
		}
	};

	CreateProject.prototype.bind = function(id) {
		this.id = id;
		injector.injectVM('#'+id, 'components/createProject');
	};
	CreateProject.prototype.setPlatformDisable = function(option, platform) {
		ko.applyBindingsToNode(option, {disable: platform.disable}, platform);
	};

	CreateProject.prototype.setTagDisable = function(option, version) {
		ko.applyBindingsToNode(option, {disable: version.disable}, version);
	};

	CreateProject.prototype.open = function() {
		console.log("OPEN:", '#open_'+this.id);
		$('#open_'+this.id).trigger('click');
	};
	CreateProject.prototype.close = function() {
		console.log("CLOSE:", '#close_'+this.id);
		$('#close_'+this.id).trigger('click');
	};

	CreateProject.prototype.didRender = function(element) {
		element.className += ' modal';
		element.style.visibility = 'visible';
		$('select').material_select();
	};

	return new CreateProject();
});
