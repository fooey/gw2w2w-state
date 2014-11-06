'use strict';

/*
*
*	dependencies
*
*/

var _ = require('lodash');
// var async = require('async');




/*
*
*	export
*
*/

module.exports = {
	generateInterval: generateInterval,
};






/*
*
*	public methods
*
*/

function generateInterval(i, intervalLimit) {
	var maxInterval = Math.pow(2, i) * 1000;

	if (intervalLimit && maxInterval > intervalLimit * 1000) {
		maxInterval = intervalLimit * 1000;
	}

	var minInterval = maxInterval / 2;

	// randomize the interval between half the maxInterval
	// console.log(minInterval, maxInterval);
	return _.random(minInterval, maxInterval);
}





/*
*
*	private methods
*
*/
