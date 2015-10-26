require('../prototypes/object.js');

var Descriptor = function(data) {
	var self = this;
	this.needsCompile = false;
	this.name = '';
	this.ext = '';
	this.versions = [];
	this.command = '';
	this.mounts = [];

	this.assign(data);
	this.hasVersion = function(version) {
		return self.versions.indexOf(version) !== -1;
	}
};

var php = new Descriptor({
	name:'php',
	ext: '.php',
	versions: [ '5.4', '5.5', '5.6', 'latest' ],
	command: 'php',
	mounts: [{
		host:'/var/www/node/eval/resources/configs/php.ini',
		guest:'/usr/local/etc/php/php.ini'
	}]
});

var nodejs = new Descriptor({
	name:'nodejs',
	ext: '.js',
	versions: [ '0.12.7', 'latest' ],
	command: 'node'
});

var haskell = new Descriptor({
	name:'haskell',
	ext: '.hs',
	versions: [ '7.10.2', 'latest' ],
	command: function(file) {
		var name = file.substring(0, file.indexOf('.'));
		return './' + name;
	}
	compile: function(file) {
		var name = file.substring(0, file.indexOf('.'));
		return 'ghc -o ' + name + ' ' + name + this.ext;
	};
});

module.exports = {
	php:php,
	nodejs:nodejs,
	haskell:haskell
};