'use strict';

module.exports = function(express, nodeEnv) {
	var app = express();

	var isDev = (nodeEnv === 'development');

	app.set('env', nodeEnv);




	/*
	*
	*	Views
	*
	*/

	app.set('case sensitive', true);
	app.set('strict routing', true);





	/*
	*
	*	Middleware
	*
	*/

	var morgan = require('morgan');
	var compression = require('compression');
	var errorhandler = require('errorhandler');
	var cors = require('errorhandler');


	if (isDev) {
		app.use(errorhandler());
		app.use(morgan('dev'));
	}
	else {
		app.use(morgan('combined'));
	}


	app.use(compression());
	app.use(cors());




	return app;
};
