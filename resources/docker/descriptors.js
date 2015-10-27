require('../prototypes/object.js');

var Descriptor = function(data) {
	var self = this;
	this.needsCompile = false;
	this.repository = '';
	this.ext = '';
	this.versions = [];
	this.command = '';
	this.compile = '';
	this.mounts = [];
	this.precode = '';

	Object.assign(this, data);
	this.hasVersion = function(version) {
		return self.versions.indexOf(version) !== -1;
	}
};

var php = new Descriptor({
	repository:'php',
	ext: '.php',
	versions: [ '5.4', '5.5', '5.6', 'latest' ],
	command: 'php',
	mounts: [{
		host:'/var/www/node/eval/resources/configs/php.ini',
		guest:'/usr/local/etc/php/php.ini'
	}],
	precode: '<?php\n\t'
});

var nodejs = new Descriptor({
	repository:'nodejs',
	ext: '.js',
	versions: [ '0.12.7', 'latest' ],
	command: 'node'
});

var haskell = new Descriptor({
	repository:'haskell',
	ext: '.hs',
	versions: [ '7.10.2', 'latest' ],
	precode: 'main = ',
	command: function(file) {
		var name = file.substring(0, file.indexOf('.'));
		return './' + name;
	},
	compile: function(file) {
		var name = file.substring(0, file.indexOf('.'));
		return 'ghc -o ' + name + ' ' + name + this.ext;
	}
});

module.exports = {
	php:php,
	nodejs:nodejs,
	haskell:haskell
};