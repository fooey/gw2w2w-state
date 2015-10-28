'use strict';

require('babel/register');
GLOBAL.data = {matches: {}, details: {}};




const nodeEnv = (process.env.NODE_ENV) ? process.env.NODE_ENV : 'production';
const isDev = (nodeEnv === 'development');
const isProd = !isDev;
const serverPort = process.env.PORT || 3000;


if (isProd) {
	require('newrelic');
}
else {
	let memwatch = require('memwatch-next');
	memwatch.on('leak', (info) => console.log('LEAK', info));
	// memwatch.on('stats', (info) => console.log('stats', info));
}

var express = require('express');
var app = require('./config/express')(express, nodeEnv);
require('./routes')(app, express);


require('./lib/data/update').init();



app.listen(serverPort, function() {
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
