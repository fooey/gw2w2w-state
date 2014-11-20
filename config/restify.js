'use strict';


module.exports = function(server, restify) {

	/*
	*
	* config
	*
	*/

	server.use(restify.gzipResponse());
	server.use(restify.CORS());

	server.use(restify.queryParser());
	server.use(restify.jsonp());
};

