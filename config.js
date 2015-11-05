global.ISLIVE = (process.env.LIVE) ? true : false;
var port = (process.env.DEV) ? 8802 : 8002;
module.exports = {
	port: port,
	dirs: {
		root: (global.ISLIVE === true ) ? '/var/www/eval' : '/shared/eval',
		bower: '/shared/bower_components'
	},
	urls: {
		mongo:'mongodb://localhost:27017/eval'
	},
	lib: {
		'requirejs.js' : 'require.js',
		'knockout.js' : 'dist/knockout.js',
		'backbone.js' : 'backbone-min.js',
		'mdl.css' : 'material.css',
		'mdl.js' : 'material.js',
		'underscore.js' : 'underscore-min.js'
	},
	libMap: { 'mdl' : 'material-design-lite' },
	aceThemes: [
		'ambiance', 				'chaos',
		'chrome', 					'clouds',
		'clouds_midnight', 			'cobalt',
		'crimson_editor',			'dawn',
		'dreamweaver',				'eclipse',
		'github',					'idle_fingers',
		'iplastic',					'katzenmilch',
		'kr_theme',					'kuroir',
		'merbivore',				'merbivore_soft',
		'mono_industrial',			'monokai',
		'pastel_on_dark',			'solarized_dark',
		'solarized_light',			'sqlserver',
		'terminal',					'textmate',
		'tomorrow',					'tomorrow_night',
		'tomorrow_night_blue',		'tomorrow_night_bright',
		'tomorrow_night_eighties',	'twilight',
		'vibrant_ink',				'xcode'
	]
};