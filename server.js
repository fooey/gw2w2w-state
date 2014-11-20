'use strict';

const isDev = (process.env.NODE_ENV === 'development');
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
require('./routes')(server, restify);



GLOBAL.data = {};
require('./lib/data/update')();





console.log(Date.now(), 'Running Node.js ' + process.version + ' with flags "' + process.execArgv.join(' ') + '"');
server.listen(serverPort, function() {
	console.log(Date.now(), 'Restify server listening on port ' + serverPort + ' in mode: ' + process.env.NODE_ENV);
});
