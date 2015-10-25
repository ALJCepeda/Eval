module.exports = {
	port: 8001,
	bowerdir:'/home/vagrant/bower_components',
	mongoURL:'mongodb://localhost:27017/test',
	lib: {
		'knockout.js' : 'dist/knockout.js'
	},
	libMap: { },
	supported: {
		'php': [ '5.4', '5.5', '5.6', '7.0' ],
		'nodejs': [ '0.12.7' ],
		'haskell' : [ '7.10.2' ]
	},
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