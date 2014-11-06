'use strict';

module.exports = function(app, express) {
	var isDev = (process.env.NODE_ENV === 'development');
	var isProd = !isDev;


	/*
	*
	* config
	*
	*/

	app.set('env', isDev ? 'development' : 'production');
	app.set('port', process.env.PORT || 3000);
	app.enable('case sensitive');
	app.enable('strict routing');


	/*
	*
	* Middleware
	*
	*/

	const compression = require('compression');
	const errorHandler = require('errorhandler');
	const morgan = require('morgan');
	const slashes = require('connect-slashes');

	if (isDev) {
		app.use(errorHandler({ dumpExceptions: true, showStack: true }));
		app.use(morgan('dev'));
	}
	else {
		app.use(errorHandler());
		app.use(morgan('combined'));
	}

	app.use(compression());
	app.use(slashes(false)); // no trailing slashes
};

