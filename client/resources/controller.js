define([], function() {
	var Controller = function(da, nav, editor, router) {
		var self = this;
		this.nav = nav;
		this.da = da;
		this.editor = editor;

		this.initialize = function() {
			self.editor.$blockScrolling = Infinity;
			self.da.getInfo(self.nav);		
		};
	
		var doc = editor.session.getDocument();
		var btn = document.getElementById("submit");
		btn.addEventListener("click", function(e) {
			var platform = self.nav.selectedPlatform();
			var version = self.nav.selectedVersion();
			var script = doc.getValue();

			var error = [];
			if(_.isUndefined(platform)) {
				error.push('You must select a platform');
			}

			if(_.isUndefined(version)) {
				error.push('You must select a version');
			}

			if(script === '') {
				error.push('You must type code into the editor');
			}

			if(error.length > 0) {
				alert(error.join('\n'));
				return;
			}

			btn.disabled = true;
			da.postScript(platform, version, script).then(function(data) {
				document.getElementById("stdout_frame").contentDocument.body.innerHTML = data.stdout;
				document.getElementById("stderr_frame").contentDocument.body.innerHTML = data.stderr;
				debugger;
				nav.selectedTab('output');
				router.navigate(data.id, { trigger:false });
				btn.disabled = false;
			}).catch(function(message) {
				alert("There was an error, please try again later");
				console.log(message);
				btn.disabled = false;
			})
		});

		var oldlanguage = self.nav.selectedPlatform.peek();
		self.nav.selectedPlatform.subscribe(function(value) {
			if(_.isUndefined(value)) {
				return;
			}

			var path = !_.isUndefined(self.nav.modeMap[value]) ? self.nav.modeMap[value] : value;
			editor.session.setMode("ace/mode/"+path);

			var docStr = doc.getValue();
			var precodes = self.nav.info().precodes;
			if(docStr === "" || docStr === precodes[oldlanguage] ) {
				doc.setValue(self.nav.info().precodes[value]);
			}

			//Need to give knockout time to update
			//Since they call subscribe before updating dependencies
			setTimeout(function() {
				var versions = self.nav.versions();
				self.nav.selectedVersion(versions[versions.length - 1]);
			}, 10);
			oldlanguage = value;
		});

		self.nav.selectedTheme.subscribe(function(value) {
			if(_.isUndefined(value)) {
				return;
			}

			editor.setTheme("ace/theme/"+value);
		});
	};

	return Controller;
});