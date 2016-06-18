define(['feeds/app'], function(appfeed) {
	var NewProject = function() {
		var self = this;
		var firstPlatform = { value: '', text: 'Choose your platform', disable:true };
		var firstTag = { value: '', text: 'Choose your version', disable:true };

		this.id = 'modal_newProject';
		this.selectedPlatform = ko.observable('');
		this.selectedTag = ko.observable('');

		this.platforms = ko.observableArray([ firstPlatform ]);
		this.tags = ko.computed(function() {
			var platform = this.selectedPlatform();
			var tags = [ firstTag ];

			if(platform === "") { return tags; }

			[].push.apply(tags, this.meta.project[platform].tags.map(function(tag) {
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

		for(var key in this.meta.project) {
			var platform = { value:key, text:this.meta.project[key].text, disable:false };
			this.platforms.push(platform);
		}
	};

	return new NewProject();
});
