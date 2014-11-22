'use strict';

/*
*
*	dependencies
*
*/

var _ = require('lodash');
var async = require('async');
var gw2api = require('gw2api');
var moment = require('moment');
// var gw2static = require('gw2w2w-static');

var libUtil = require('../util');
var libDetails = require('./matchdetails');




/*
*
*	module globals
*
*/

var dataObj;



/*
*
*	export
*
*/

module.exports = {
	init: init,

	getRemote: getRemote,
	updateLocalData: updateLocalData,
};





/*
*
*	init
*
*/

function init(obj, cb) {
	dataObj = obj;

	process.nextTick(updateMatches);

	cb();
}



/*
*
*	public methods
*
*/

function getRemote(cb) {
	gw2api.getMatches(cb);
}



function updateMatches(cb) {
	getRemote(function(err, data) {
		updateLocalData(data);

		var interval = _.random(30 * 1000, 60 * 1000);
		console.log(Date.now(), 'lib::data::update::updateMatches()::next', interval);
		setTimeout(updateMatches, interval);

		(cb || _.noop)();
	});
}



function updateLocalData(data) {
	var gdm = dataObj.matches;
	var gdd = dataObj.details;

	var data = _.sortBy(data, 'wvw_match_id');

	_.each(data, function(matchData) {
		var matchId = matchData.wvw_match_id;

		var match = {
			id: matchData.wvw_match_id,
			startTime: moment(matchData.start_time).unix(),
			endTime: moment(matchData.end_time).unix(),
			redId: matchData.red_world_id,
			blueId: matchData.blue_world_id,
			greenId: matchData.green_world_id,
			region: _.parseInt(matchId.charAt(0)),
		};


		if (!gdm[matchId] || match.startTime !== gdm[matchId].startTime) {
			resetMatch(matchId);
		}

		dataObj.matches[matchId] = _.merge(dataObj.matches[matchId], match);
	});
}

function resetMatch(matchId) {
	console.log(Date.now(), 'lib::data::matches::resetMatch()', matchId);

	dataObj.details[matchId] = libDetails.getInitialState(matchId);
	dataObj.matches[matchId] = {};
}
