require('../prototypes/object.js');

var Descriptor = function(data) {
	var self = this;
	this.name = '';
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
	versions: [ '5.4', '5.5', '5.6', 'latest' ],
	command: 'php',
	mounts: [{
		host:'/var/www/node/eval/resources/configs/php.ini',
		guest:'/usr/local/etc/php/php.ini'
	}]
});

var nodejs = new Descriptor({
	name:'nodejs',
	versions: [ '0.12.7', 'latest' ],
	command: 'node'
});

var haskell = new Descriptor({
	name:'haskell',
	versions: [ '7.10.2', 'latest' ],
	command: 'ghc'
});

module.exports = {
	php:php,
	nodejs:nodejs,
	haskell:haskell
};