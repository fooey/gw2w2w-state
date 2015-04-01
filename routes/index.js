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
		console.log('matches', req.params);
		res.send(dataObj.matches);
	});

	const matchesByRegionId = /^\/matches\/([12])$/;
	app.get(matchesByRegionId, function(req, res) {
		const regionId = _.parseInt(req.params[0]);
		console.log('matches by regionId', regionId);

		res.send(
			_.chain(dataObj.matches)
				.filter({region: regionId})
				.indexBy('id')
				.value()
		);
	});

	const matchesByMatchId = /^\/matches\/([12]-[1-9])$/;
	app.get(matchesByMatchId, function(req, res) {
		const matchId = req.params[0];
		const match = dataObj.matches[matchId];

		// res.header('Last-Modified', match.lastmod * 1000);

		console.log('fresh', req.fresh);

		res.send(match);
	});



	/*
	* matchDetails
	*/

	const detailsByMatchId = /^\/([12]-[1-9])$/;
	app.get(
		detailsByMatchId,
		function(req, res) {
			const matchId = req.params[0];
			const matchDetails = getDetails(matchId);

			console.log('detailsByMatchId', matchId);

			if (matchDetails && matchDetails.match) {
				res.header('Last-Modified', matchDetails.match.lastmod * 1000);
				res.header('Etag', `matchDetails::${matchId}::${matchDetails.match.lastmod}`);
			}

			res.send(matchDetails);
		}
	);

	const detailsByWorldSlug = /^\/world\/([a-z-]+)$/;
	app.get(detailsByWorldSlug, function(req, res) {
		const worldSlug = req.params[0];
		console.log('details by worldSlug', worldSlug);

		const world = getWorldBySlug(worldSlug);
		const match = getMatchByWorldId(world.id);
		const matchId = match.id;
		const matchDetails = getDetails(matchId);

		if (match) {
			res.header('Last-Modified', matchDetails.match.lastmod * 1000);
			res.header('Etag', `matchDetails::${matchId}::${matchDetails.match.lastmod}`);
			res.send(matchDetails);
		}
		else {
			res.send(404, 'Not Found');
		}
	});







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