'use strict';

/*
*
*	dependencies
*
*/

const libMatches = require('./matches');
const libDetails = require('./matchdetails');




/*
*
*	module globals
*
*/

var matches = {};
var details = {};



/*
*
*	export
*
*/

var dataObj = {
	init: init,
	matches: matches,
	details: details,
};

module.exports = dataObj;



/*
*
*	public methods
*
*/

function init(callback) {
	console.log('data:update:init');

	matches = {};
	details = {};

	libMatches.init(
		dataObj,
		libDetails.init.bind(null, dataObj, callback)
	);
}
