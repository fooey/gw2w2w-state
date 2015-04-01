'use strict';

const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';
const isDev = (nodeEnv === 'development');
const isProd = !isDev;
const serverPort = process.env.PORT || 3000;


if (isProd) {
	require('newrelic');
}




const restify = require('restify');

var server = restify.createServer({
	name: 'state.gw2w2w.com',
});
require('./config/restify')(server, restify);



var dataObj = require('./lib/data/update');

dataObj.init(function() {

	require('./routes')(server, restify, dataObj);


	server.listen(serverPort, function() {
		console.log('');
		console.log('**************************************************');
		console.log('Express server started');
		console.log('Time: %d', Date.now());
		console.log('Port: %d', serverPort);
		console.log('Mode: %s', nodeEnv);
		console.log('PID: %s', process.pid);
		console.log('Platform: %s', process.platform);
		console.log('Arch: %s', process.arch);
		console.log('Node: %s', process.versions.node);
		console.log('V8: %s', process.versions.v8);
		console.log('**************************************************');
		console.log('');
	});

});
