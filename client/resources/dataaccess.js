define(['resources/ajaxer'], function(Ajaxer) {
	var DataAccess = function() {
		var self = this;
		this.ajax = new Ajaxer();

		this.getInfo = function(nav) {
			self.ajax.get("/info").then(function(message) {
				var data = JSON.parse(message);
				nav.info(data);

				nav.selectedPlatform("php");
				nav.selectedVersion("5.6");
				nav.selectedTheme("twilight");
			}, function(message) {
				alert("There was an issue contacting the server, please try reloading the page");
				console.log(message);
			});
		};

		this.getScript = function(id) {
			return self.ajax.get("/script/"+id).then(JSON.parse);
		};

		this.postScript = function(platform, version, script) {
			return self.ajax.post("/compile", {
				platform:platform,
				version:version,
				script:script
			}).then(JSON.parse);
		};


	};

	return DataAccess;
});