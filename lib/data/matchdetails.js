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

var libUtil = require('../util');





/*
*
*	module globals
*
*/

const objectiveMeta = require('gw2w2w-static').objective_meta;
const objectiveTypes = require('gw2w2w-static').objective_types;

const holdingsBase = [];
_.each(objectiveTypes, function(ot) {
	if (ot.value) {
		holdingsBase[ot.id - 1] = 0;
	}
});


const queueCycleTime = 2000; // desired time to get through the entire queue

var queue;





/*
*
*	export
*
*/

module.exports = {
	startUpdater: startUpdater,
	getInitialState: getInitialState,
	// updateMatchDetails: updateMatchDetails,
	// initMatchDetails: initMatchDetails,
};






/*
*
*	init
*
*/

function startUpdater() {
	queue = [];
	processQueue();
}



function getInitialState(id) {
	return {
		id: id,
		maps: {
			scores: [],
			ticks: [],
			holdings: [],
		},
		objectives: {
			owners: {},
			claimers: {},
		},
		history: [],
		initialized: false,
	};
}




/*
*
*	queue
*
*/

function processQueue() {
	// console.log(Date.now(), 'lib::data::details::processQueue()');

	var matchIds = _.pluck(GLOBAL.data.matches, 'id');		// id's in match data
	var toQueue = _.difference(matchIds, queue).sort(); 	// match id's not in queue

	// toQueue = ['1-2'];

	queue = _.uniq(queue.concat(toQueue));

	var interval = getInterval(queue.length, queueCycleTime);

	if (queue.length) {
		updateMatchDetails(
			queue.shift(),
			scheduleQueue.bind(null, interval)
		);
	}
	else {
		scheduleQueue(interval);
	}

}

function scheduleQueue(interval) {
	// var interval = libUtil.generateInterval(-1); // 250-500 ms

	// console.log(Date.now(), 'lib::data::details::scheduleQueue()', interval);
	setTimeout(processQueue, interval);
}




/*
*
*	data
*
*/

function getRemote(matchId, cb) {
	gw2api.getMatchDetails({'match_id': matchId}, cb);
}

function updateMatchDetails(matchId, cb) {
	var isInit = false;

	getRemote(matchId, function(err, detailsData) {
		// console.log(Date.now(), 'lib::data::update::updateMatchDetails()', matchId);

		if (err || !detailsData || !detailsData.match_id) {
			cb();
		}
		else {
			if (!GLOBAL.data.details[matchId].initialized) {
				isInit = true;
			}

			async.auto({
				matchScores: [setMatchScores.bind(null, matchId, detailsData)],
				detailScores: [setDetailScores.bind(null, matchId, detailsData)],

				tmpObjectives: [getMatchObjectives.bind(null, detailsData)],

				objectiveOwners: ['tmpObjectives', setObjectiveOwners.bind(null, isInit, matchId)],
				objectiveClaimers: ['tmpObjectives', setObjectiveClaimers.bind(null, isInit, matchId)],
				history: ['objectiveOwners', 'objectiveClaimers', setHistory.bind(null, matchId)],

				detailHoldings: [setDetailHoldings.bind(null, matchId, detailsData)],
				detailTicks: ['detailHoldings', setDetailTicks.bind(null, matchId)],

				matchHoldings: ['tmpObjectives', setMatchHoldings.bind(null, matchId)],
				matchTicks: ['matchHoldings', setMatchTicks.bind(null, matchId)],

			}, function(err) {
				// console.log(Date.now(), 'lib::data::update::updateMatchDetails()', matchId, 'complete');
				GLOBAL.data.details[matchId].initialized = true;
				cb();
			});
		}
	});
}




/*
*
*	state
*
*/

function getMatchObjectives(detailsData, cb) {
	var objectives;

	if (detailsData && detailsData.maps) {
		var objectives = _
			.chain(detailsData.maps)
			.pluck('objectives')
			.flatten(false)
			.filter(function(o) {
				return (_.has(objectiveMeta, o.id));
			})
			.sortBy('id')
			.map(function(o) {
				o.owner = o.owner.toLowerCase();
				return o;
			})
			.value();
	}

	cb(null, objectives);

}


function setObjectiveOwners(isInit, matchId, cb, autoData) {
	// console.log(Date.now(), 'lib::data::update::setObjectiveOwners()', matchId);

	var now = moment().unix();
	var gdo = GLOBAL.data.details[matchId].objectives.owners;

	var owners = {};

	_.each(autoData.tmpObjectives, function(o) {
		var newOwner = !!(isInit || !gdo[o.id] || gdo[o.id].world !== o.owner);
		var ownerTimestamp = (!newOwner) ? gdo[o.id].timestamp : now;

		if (!isInit && newOwner) {
			console.log(matchId, o.id, 'new owner', o.owner);

			GLOBAL.data.details[matchId].history.unshift({
				type: 'capture',
				timestamp: now,
				objectiveId: o.id,
				world: o.owner
			});

			if (GLOBAL.data.details[matchId].objectives.claimers[o.id]) {
				delete GLOBAL.data.details[matchId].objectives.claimers[o.id];
			}
		}

		owners[o.id] = {
			world: o.owner,
			timestamp: ownerTimestamp,
		};
	});

	GLOBAL.data.details[matchId].objectives.owners = owners;

	cb(null);
}



function setObjectiveClaimers(isInit, matchId, cb, autoData) {
	// console.log(Date.now(), 'lib::data::update::setObjectiveClaimers()', matchId);

	var now = moment().unix();
	var gdg = GLOBAL.data.details[matchId].objectives.claimers;

	var claimers = {};

	_.each(autoData.tmpObjectives, function(o) {
		var hasClaimer = !!(o && o.owner_guild);
		var hadClaimer = !!(gdg && gdg[o.id]);
		var newClaimer = !!(
			isInit
			|| (hasClaimer && !hadClaimer)
			|| (hasClaimer && hadClaimer && gdg[o.id].guild !== o.owner_guild)
		);

		if (!isInit && newClaimer) {
			console.log(matchId, o.id, 'new claimer', o.owner_guild);

			GLOBAL.data.details[matchId].history.unshift({
				type: 'claim',
				timestamp: now,
				objectiveId: o.id,
				world: o.owner,
				guild: o.owner_guild
			});
		}
		else if (hadClaimer && !hasClaimer) {
			console.log(matchId, o.id, 'dropped claimer', gdg[o.id].guild);
		}


		if (hasClaimer) {
			var claimerTimestamp = (newClaimer) ? now : gdg[o.id].timestamp;

			claimers[o.id] = {
				guild: o.owner_guild,
				timestamp: claimerTimestamp,
			};
		}
	});

	GLOBAL.data.details[matchId].objectives.claimers = claimers;

	cb();
}

function setHistory(matchId, cb, autoData) {
	var gdh = GLOBAL.data.details[matchId].history;
	var historySize = gdh.length;

	if (gdh && gdh.length) {
		GLOBAL.data.details[matchId].history = gdh.slice(0, 100);
	}

	cb();
}



function setMatchScores(matchId, detailsData, cb) {
	// console.log(Date.now(), 'lib::data::update::setMatchScores()', matchId);
	if (detailsData && detailsData.scores) {
		GLOBAL.data.matches[matchId].scores = detailsData.scores;
	}
	cb();
}



function setMatchHoldings(matchId, cb, autoData) {
	var holdings = [
		_.cloneDeep(holdingsBase),
		_.cloneDeep(holdingsBase),
		_.cloneDeep(holdingsBase),
	];

	_.each(autoData.tmpObjectives, function(o) {
		var oMeta = objectiveMeta[o.id];
		var colorIndex = getColorIndex(o.owner);
		if (!_.isNull(colorIndex)) {
			holdings[colorIndex][oMeta.type - 1]++;
		}
	});

	GLOBAL.data.matches[matchId].holdings = holdings;
	cb(null, holdings);
}



function setMatchTicks(matchId, cb, autoData) {
	var ticks = _.map(
		autoData.matchHoldings,
		getTickFromHoldings
	);

	GLOBAL.data.matches[matchId].ticks = ticks;
	cb();
}


function getTickFromHoldings(holdings) {
	return _.reduce(
		holdings,
		function(tickSum, typeCount, ixType) {
			var oType = objectiveTypes[ixType + 1];
			return tickSum + (oType.value * typeCount);
		},
		0
	);
}



function setDetailScores(matchId, detailsData, cb) {
	// console.log(Date.now(), 'lib::data::update::setMatchScores()', matchId);
	if (detailsData && detailsData.maps) {
		GLOBAL.data.details[matchId].maps.scores = _.pluck(detailsData.maps, 'scores');
	}
	cb();
}



function setDetailHoldings(matchId, detailsData, cb) {
	var mapHoldings = [
		_.cloneDeep(holdingsBase),
		_.cloneDeep(holdingsBase),
		_.cloneDeep(holdingsBase),
	];

	var holdings = [
		_.cloneDeep(mapHoldings),
		_.cloneDeep(mapHoldings),
		_.cloneDeep(mapHoldings),
		_.cloneDeep(mapHoldings),
	];

	if (detailsData && detailsData.maps) {
		_.each(detailsData.maps, function(map, mapIndex) {
			_.each(map.objectives, function(o, oIndex) {
				var oMeta = objectiveMeta[o.id];
				if (oMeta) {
					var colorIndex = getColorIndex(o.owner);
					if (!_.isNull(colorIndex)) {
						holdings[mapIndex][colorIndex][oMeta.type - 1]++;
					}
				}
			});
		});

		GLOBAL.data.details[matchId].maps.holdings = holdings;
	}

	cb(null, holdings);
}



function setDetailTicks(matchId, cb, autoData) {
	var ticks = _.map(
		autoData.detailHoldings,
		function(mapHoldings) {
			return _.map(mapHoldings, getTickFromHoldings);
		}
	);

	GLOBAL.data.details[matchId].maps.ticks = ticks;
	cb();
}



/*
*
*	util
*
*/

function getColorIndex(color) {
	color = color.toLowerCase();

	if (color === 'red') {return 0;}
	else if (color === 'blue') {return 1;}
	else if (color === 'green') {return 2;}
	else {return null;}
}

function getInterval(queueSize, cycleTime) {
	if (!queueSize) {
		return cycleTime;
	}

	var baseInterval = cycleTime / queueSize;
	return Math.floor(_.random(baseInterval / 2, baseInterval * 2));
}
