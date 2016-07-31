define([ 'app', 'scripts/controller' ],
		function(App, Controller) {
	var app = new App();
	var controller = new Controller();

	app.controller = controller;
	app.start();
});
