'use strict';

/*
*
*	dependencies
*
*/

var libMatches = require('./matches');
var libDetails = require('./matchdetails');



/*
*
*	export
*
*/

module.exports = function init() {
	GLOBAL.data.matches = {};
	GLOBAL.data.details = {};

	libMatches.startUpdater(libDetails.startUpdater);
 };
