global.LOCAL = (process.argv.indexOf('--local') !== -1) ? true : false;
global.DEV = (process.argv.indexOf('--dev') !== -1) ? true : false;

if(global.LOCAL === true) {
	console.log("-------------Started local app-------------");
	global.ROOT = '/shared/eval';
} else {
	global.ROOT = '/var/www/eval';
}

module.exports = {
	port: (global.DEV === true) ? 8802 : 8002,
	dirs: {
		temp: '/var/tmp/eval'
	},
	urls: {
		mongo:(global.DEV === true) ? 'mongodb://localhost:27017/deveval' : 'mongodb://localhost:27017/eval'
	}
};