'use strict';

if (app.get('env') !== 'development') {
	require('newrelic');
}



const express = require('express');
const app = express();
const server = require('http').createServer(app);
require('./config/express')(app, express);



GLOBAL.data = {};
// GLOBAL.ws = require('./lib/websockets')(server);



require('./routes')(app, express);
require('./lib/data/update')();





console.log(Date.now(), 'Running Node.js ' + process.version + ' with flags "' + process.execArgv.join(' ') + '"');
server.listen(app.get('port'), function() {
	console.log(Date.now(), 'Express server listening on port ' + app.get('port') + ' in mode: ' + app.get('env'));
});
