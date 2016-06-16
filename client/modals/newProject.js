define(['data/info'], function(info) {
	var NewProject = function() {
		var self = this;
		var firstPlatform = { value: '', text: 'Choose your platform', disable:true };
		var firstVersion = { value: '', text: 'Choose your version', disable:true };

		this.id = '';
		this.selectedPlatform = ko.observable('');
		this.selectedVersion = ko.observable('');

		this.platforms = ko.observableArray([ firstPlatform ]);
		this.versions = ko.computed(function() {
			var platform = this.selectedPlatform();
			var tags = [ firstVersion ];

			if(platform === "") { return tags; }

			[].push.apply(tags, info[platform].tags.map(function(tag) {
				return { value: tag, text: tag, disable: false };
			}));

			this.selectedVersion('');
			setTimeout(function() {
				$('#selectVersion').material_select();
			});

			return tags;
		}.bind(this));

		this.setPlatformDisable = function(option, platform) {
			ko.applyBindingsToNode(option, {disable: platform.disable}, platform);
		};
		this.setVersionDisable = function(option, version) {
			ko.applyBindingsToNode(option, {disable: version.disable}, version);
		};

		this.trigger = function() { $('#toggle_'+this.id).trigger('click'); };

		this.didRender = function(element) {
			element.className += ' modal';
			element.style.visibility = 'visible';
			$('select').material_select();
		};

		for(var key in info) {
			var platform = { value:key, text:info[key].text, disable:false };
			this.platforms.push(platform);
		}
	};

	return new NewProject();
});
