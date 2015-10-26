'use strict';

/*
*
*	dependencies
*
*/

import _ from 'lodash';
import async from 'async';
import gw2api from 'gw2api';
import moment from 'moment';

import libDetails from './matchdetails';




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

// export default {
// 	init: init,

// 	getRemote: getRemote,
// 	updateLocalData: updateLocalData,
// 	updateFromRemote: updateFromRemote,
// };


export function updateFromRemote(remoteData, cb) {
	console.log('matchDetails::updateFromRemote');
	const now = moment().unix();

	// GLOBAL.data.matches = _
	// 	.chain(remoteData)
	// 	.map(match => {
	// 		match.startTime = moment(match.start_time).unix();
	// 		match.endTime = moment(match.end_time).unix();
	// 		match.region = match.id[0];

	// 		delete match.maps;
	// 		delete match.start_time;
	// 		delete match.end_time;
	// 		return match;
	// 	})
	// 	.indexBy('id')
	// 	.value();

	// console.log(GLOBAL.data.matches);

	return cb();
};


function getMatchLastMod(maps) {
	let last_mod = 0;

	let objectives = _.chain(maps)
		.pluck('objectives')
		.flatten()
		.map(o => {
			o.last_flipped = o.last_flipped ? moment(o.last_flipped).unix() : 0;
			o.claimed_at = o.claimed_at ? moment(o.claimed_at).unix() : 0;
			o.last_mod = Math.max(o.last_flipped, o.claimed_at);

			last_mod = Math.max(last_mod, o.last_mod);

			return o;
		})
		.value();

	return last_mod;


	// return maps.reduce((map, acc) => {

	// }, 0);
}



function updateLocalData(data) {
	var now = moment().unix();

	if (data && _.isArray(data) && data.length) {
		var gdm = dataObj.matches;
		// var gdd = dataObj.details;

		_.each(data, function(matchData) {
			if (matchData && matchData.wvw_match_id) {
				var matchId = matchData.wvw_match_id;

				var match = {
					id: matchData.wvw_match_id,
					startTime: moment(matchData.start_time).unix(),
					endTime: moment(matchData.end_time).unix(),
					redId: matchData.red_world_id,
					blueId: matchData.blue_world_id,
					greenId: matchData.green_world_id,
					region: _.parseInt(matchId.charAt(0)),
					lastmod: now,
				};


				if (!gdm[matchId] || match.startTime !== gdm[matchId].startTime) {
					resetMatch(matchId);
				}

				dataObj.matches[matchId] = _.merge(dataObj.matches[matchId], match);
			}
		});
	}
}

function resetMatch(matchId) {
	console.log(Date.now(), 'lib::data::matches::resetMatch()', matchId);

	dataObj.details[matchId] = libDetails.getInitialState(matchId);
	dataObj.matches[matchId] = {};
}






/*
*
*	init
*
*/

// function init(obj, cb) {
// 	dataObj = obj;

// 	process.nextTick(updateMatches);

// 	cb();
// }



/*
*
*	public methods
*
*/

// function getRemote(cb) {
// 	gw2api.getMatches(cb);
// }



// function updateMatches(cb) {
// 	getRemote(function(err, data) {
// 		updateLocalData(data);

// 		var interval = _.random(30 * 1000, 60 * 1000);
// 		console.log(Date.now(), 'lib::data::update::updateMatches()::next', interval);
// 		setTimeout(updateMatches, interval);

// 		(cb || _.noop)();
// 	});
// }
