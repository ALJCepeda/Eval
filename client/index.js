
function loaded() {
	var editor = ace.edit("editor");
	editor.$blockScrolling = Infinity;

	var doc = editor.session.getDocument();
	var nav = new Navbar();
	var ajax = new Ajaxer();

	ajax.get("/info").then(function(message) {
		var data = JSON.parse(message);
		nav.info(data);

		nav.selectedPlatform("php");
		nav.selectedVersion("5.6");
		nav.selectedTheme("twilight");
	}, function(message) {
		alert("There was an issue, please try again");
		console.log(message);
	});

	var btn = document.getElementById("submit");
	btn.addEventListener("click", function(e) {
		var platform = nav.selectedPlatform();
		var version = nav.selectedVersion();
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
		ajax.post("/compile", {
			platform:platform,
			version:version,
			script:script
		}).then(function(message) {
			var data = JSON.parse(message);
			document.getElementById("stdout_frame").contentDocument.body.innerHTML = data.stdout;
			document.getElementById("stderr_frame").contentDocument.body.innerHTML = data.stderr;

			nav.selectedTab('output');
			btn.disabled = false;
		}, function(message) {
			alert("There was an error, please try again later");
			console.log(message);
			btn.disabled = false;
		});
	});

	var oldlanguage = nav.selectedPlatform.peek();
	nav.selectedPlatform.subscribe(function(value) {
		if(_.isUndefined(value)) {
			return;
		}

		var path = !_.isUndefined(nav.modeMap[value]) ? nav.modeMap[value] : value;
		editor.session.setMode("ace/mode/"+path);

		var docStr = doc.getValue();
		var precodes = nav.info().precodes;
		if(docStr === "" || docStr === precodes[oldlanguage] ) {
			doc.setValue(nav.info().precodes[value]);
		}

		//Need to give knockout time to update
		//Since they call subscribe before updating dependencies
		setTimeout(function() {
			var versions = nav.versions();
			nav.selectedVersion(versions[versions.length - 1]);
		}, 10);
		oldlanguage = value;
	});

	nav.selectedTheme.subscribe(function(value) {
		if(_.isUndefined(value)) {
			return
		}

		editor.setTheme("ace/theme/"+value);
	});

	ko.applyBindings(nav);
}
