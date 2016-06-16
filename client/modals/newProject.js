define(['app'], function(app) {
	var NewProject = function() {
		var self = this;
		var firstPlatform = { value: '', text: 'Choose your platform', disable:true };
		var firstTag = { value: '', text: 'Choose your version', disable:true };

		this.id = '';
		this.selectedPlatform = ko.observable('');
		this.selectedTag = ko.observable('');

		this.platforms = ko.observableArray([ firstPlatform ]);
		this.tags = ko.computed(function() {
			var platform = this.selectedPlatform();
			var tags = [ firstTag ];

			if(platform === "") { return tags; }

			[].push.apply(tags, app.meta.project[platform].tags.map(function(tag) {
				return { value: tag, text: tag, disable: false };
			}));

			this.selectedTag('');
			setTimeout(function() {
				$('#selectVersion').material_select();
			});

			return tags;
		}.bind(this));

		this.setPlatformDisable = function(option, platform) {
			ko.applyBindingsToNode(option, {disable: platform.disable}, platform);
		};
		this.setTagDisable = function(option, version) {
			ko.applyBindingsToNode(option, {disable: version.disable}, version);
		};

		this.submit = function() {
			var platform = this.selectedPlatform();
			var tag = this.selectedTag();

			app.createProject(platform, tag);
		};

		this.trigger = function() { $('#toggle_'+this.id).trigger('click'); };

		this.didRender = function(element) {
			element.className += ' modal';
			element.style.visibility = 'visible';
			$('select').material_select();
		};

		for(var key in app.meta.project) {
			var platform = { value:key, text:app.meta.project[key].text, disable:false };
			this.platforms.push(platform);
		}
	};

	return new NewProject();
});
