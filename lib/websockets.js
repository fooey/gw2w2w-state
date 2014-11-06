'use strict';

var primus;

module.exports = function(server) {
	// Primus server
	const Primus = require('primus.io');
	const primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' });



	var chanGlobal = primus.channel('global');

	primus.on('connection', function(spark) {
		spark.send('primus', 'ehlo');
		
		spark.on('incoming::ping', function() {
			console.log(spark.id, 'primus', 'incoming::ping');
		});
		spark.on('outgoing::pong', function() {
			console.log(spark.id, 'primus', 'outgoing::pong');
		});

		console.log(spark.id, 'primus', 'on connection');
	});
	primus.on('error', function(spark) {
		console.log(spark.id, 'chanGlobal', 'on error');
	});


	primus.on('data', function(spark) {
		console.log(spark.id, 'primus', 'on data');
	});
	primus.on('end', function(spark) {
		console.log(spark.id, 'primus', 'on end');
	});
	primus.on('close', function(spark) {
		console.log(spark.id, 'primus', 'on close');
	});
	primus.on('log', function(spark) {
		console.log(spark.id, 'primus', 'on log');
	});

	chanGlobal.on('connection', function(spark) {
		console.log(spark.id, 'chanGlobal', 'on connection');
	});

	return primus;
};
