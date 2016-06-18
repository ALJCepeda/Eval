define(['feeds/app'], function(appfeed) {
	var NewProject = function() {
		var self = this;
		var firstPlatform = { value: '', text: 'Choose your platform', disable:true };
		var firstTag = { value: '', text: 'Choose your version', disable:true };

		this.id = 'modal_newProject';
		this.meta = ko.observable({});
		this.selectedPlatform = ko.observable('');
		this.selectedTag = ko.observable('');
		this.platforms = ko.observableArray([ firstPlatform ]);

		this.platforms = ko.computed(function() {
			var meta = this.meta();
			var newPlatforms = [ firstPlatform ];

			for(var key in meta.project) {
				var platform = { value:key, text:meta.project[key].text, disable:false };
				newPlatforms.push(platform);
			}

			return newPlatforms;
		}.bind(this));

		this.tags = ko.computed(function() {
			var meta = this.meta();
			var platform = this.selectedPlatform();
			var tags = [ firstTag ];

			if(platform === "") { return tags; }

			[].push.apply(tags, meta.project[platform].tags.map(function(tag) {
				return { value: tag, text: tag, disable: false };
			}));

			this.selectedTag('');
			setTimeout(function() {
				$('#selectVersion').material_select();
			});

			return tags;
		}.bind(this));

		appfeed.subscribe('didInit', function(context) {
			this.init(context.ids.newProject);
		}.bind(this));

		appfeed.subscribe('fetchedMeta', function(meta) {
			this.meta(meta);
		}.bind(this));
	};

	NewProject.prototype.init = function(id) {
		this.id = id;
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

	NewProject.prototype.trigger = function() {
		$('#toggle_'+this.id).trigger('click');
	};

	NewProject.prototype.didRender = function(element) {
		element.className += ' modal';
		element.style.visibility = 'visible';
		$('select').material_select();
	};

	NewProject.prototype.updateMeta = function(meta) {
		this.meta = meta;


	};

	return new NewProject();
});
