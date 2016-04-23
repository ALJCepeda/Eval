define(['resources/ajaxer'], function(Ajaxer) {
	var DataAccess = function() {
		var self = this;
		this.ajax = new Ajaxer();
		this.last = '';
		this.getInfo = function(nav) {
			self.ajax.get("/info").then(function(message) {
				var data = JSON.parse(message);
				nav.info(data);

				nav.selectedPlatform("nodejs");
				nav.selectedVersion("latest");
				nav.selectedTheme("twilight");
			}, function(message) {
				alert("There was an issue contacting the server, please try reloading the page");
				console.log(message);
			});
		};

		this.getScript = function(id) {
			return self.ajax.get("/script/"+id).then(JSON.parse);
		};

		this.postScript = function(platform, version, code, last) {
			return self.ajax.post("/compile", {
				platform:platform,
				version:version,
				code:code,
				last:last
			}).then(JSON.parse);
		};
	};

	return DataAccess;
});