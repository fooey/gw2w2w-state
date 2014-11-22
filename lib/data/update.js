'use strict';

/*
*
*	dependencies
*
*/

var libMatches = require('./matches');
var libDetails = require('./matchdetails');

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



function init(callback) {
	console.log('data:update:init');

	matches = {};
	details = {};

	libMatches.init(
		dataObj,
		libDetails.init.bind(null, dataObj, callback)
	);
}
