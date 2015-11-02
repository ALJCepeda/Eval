
function loaded() {
	var editor = ace.edit("editor");
	editor.$blockScrolling = Infinity;

	var doc = editor.session.getDocument();
	var nav = new Navbar();
	var ajax = new Ajaxer();

	ajax.get("/info").then(function(message) {
		var data = JSON.parse(message);
		nav.info(data);

		nav.selectedLanguage("php");
		nav.selectedTheme("twilight");
	}, function(message) {
		alert("There was an issue, please try again");
		console.log(message);
	});

	var btn = document.getElementById("submit");
	btn.addEventListener("click", function(e) {
		btn.disabled = true;
		ajax.post("/compile", {
			type:nav.selectedLanguage(),
			version:nav.selectedVersion(),
			script:doc.getValue()
		}).then(function(message) {
			var data = JSON.parse(message);
			document.getElementById("stdout_container").innerHTML = data.stdout;
			document.getElementById("stderr_container").innerHTML = data.stderr;
			
			btn.disabled = false;
		}, function(message) {
			alert("There was an error, please try again later");
			console.log(message);
		});
	});

	var oldlanguage = nav.selectedLanguage.peek();
	nav.selectedLanguage.subscribe(function(value) {
		var path = !_.isUndefined(nav.modeMap[value]) ? nav.modeMap[value] : value;
		editor.session.setMode("ace/mode/"+path);

		var docStr = doc.getValue();
		var precodes = nav.info().precodes;
		if(docStr === "" || docStr === precodes[oldlanguage] ) {
			doc.setValue(nav.info().precodes[value]);
		}
		oldlanguage = value;
	});

	nav.selectedTheme.subscribe(function(value) {
		if(!_.isUndefined(value)) {
			editor.setTheme("ace/theme/"+value);
		}
	})

	ko.applyBindings(nav);
}
