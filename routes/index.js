'use strict';

const _ = require('lodash');


module.exports = function(app, express, dataObj) {



	/*
	* static
	*/

	app.use(express.static(
		'public',
		{
			index: 'index.html'
		}
	));




	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});





	/*
	* debug
	*/

	app.get('/dump', function(req, res) {
		res.send(dataObj);
	});



	/*
	* matches
	*/

	app.get('/matches$', function(req, res) {
		const matchesLastmod = _.reduce(
			dataObj.matches,
			(cur, match) => Math.max(match.lastmod, cur),
			0
		);

		const lastmod = matchesLastmod ? matchesLastmod * 1000 : Date.now();
		const etag = `matches::${lastmod}`;

		conditionallyRespond(req, res, lastmod, etag, dataObj.matches);
	});

	const matchesByRegionId = /^\/matches\/([12])$/;
	app.get(matchesByRegionId, function(req, res) {
		const regionId = _.parseInt(req.params[0]);
		console.log('matches by regionId', regionId);

		const regionMatches = _
			.chain(dataObj.matches)
			.filter({region: regionId})
			.indexBy('id')
			.value();

		const matchesLastmod = _.reduce(
			regionMatches,
			(cur, match) => Math.max(match.lastmod, cur),
			0
		);

		const lastmod = matchesLastmod ? matchesLastmod * 1000 : Date.now();
		const etag = `matches::${lastmod}`;

		conditionallyRespond(req, res, lastmod, etag, regionMatches);
	});

	const matchesByMatchId = /^\/matches\/([12]-[1-9])$/;
	app.get(matchesByMatchId, function(req, res) {
		const matchId = req.params[0];
		const match = dataObj.matches[matchId];

		const lastmod = (match) ? match.lastmod * 1000 : Date.now();
		const etag = `match::${matchId}::${lastmod}`;


		conditionallyRespond(req, res, lastmod, etag, match);
	});



	/*
	* matchDetails
	*/

	const detailsByMatchId = /^\/([12]-[1-9])$/;
	app.get(detailsByMatchId, function(req, res) {
		const matchId = req.params[0];

		returnMatchDetails(matchId, req, res);
	});

	const detailsByWorldSlug = /^\/world\/([a-z-]+)$/;
	app.get(detailsByWorldSlug, function(req, res) {
		const worldSlug = req.params[0];
		const world = getWorldBySlug(worldSlug);
		const match = getMatchByWorldId(world.id);
		const matchId = match.id;

		returnMatchDetails(matchId, req, res);
	});





	function returnMatchDetails(matchId, req, res) {
		const matchDetails = getDetails(matchId);

		res.send(matchDetails);
		// conditionallyRespond(req, res, lastmod, etag, matchDetails);
	}


	function conditionallyRespond(req, res, lastmod, etag, payload) {
		lastmod = lastmod.toString();

		const notModified = (req.get('if-modified-since') && req.get('if-modified-since') === lastmod);
		const isMatch = (req.get('if-none-match') && req.get('if-none-match') === etag);

		const isStale = notModified || isMatch;

		// console.log(notModified, isMatch, isStale);

		if (isStale) {
			res.sendStatus(304);
		}
		else {
			res.header('Last-Modified', lastmod);
			res.header('Etag', etag);
			res.send(payload);
		}

	}




	function getDetails(matchId) {
		return {
			now: Date.now(),
			match: dataObj.matches[matchId],
			details: dataObj.details[matchId],
		};
	}



	function getWorldBySlug(worldSlug) {
		const worlds = require('gw2w2w-static').worlds;

		return _.find(worlds, function(world) {
			return (
				world.en.slug === worldSlug
				|| world.es.slug === worldSlug
				|| world.de.slug === worldSlug
				|| world.fr.slug === worldSlug
			);
		});
	}



	function getMatchByWorldId(worldId) {
		return _.find(dataObj.matches, function(match) {
			return (
				worldId == match.redId
				|| worldId == match.blueId
				|| worldId == match.greenId
			);
		});
	}

};