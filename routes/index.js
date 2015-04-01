'use strict';

const _ = require('lodash');


module.exports = function(server, restify, dataObj) {


	/*
	* config
	*/

	server.pre(restify.pre.sanitizePath());
	restify.conditionalRequest();



	/*
	* static
	*/

	server.get("/", restify.serveStatic({
		directory: process.cwd() + '/public',
		default: 'index.html'
	}));





	/*
	* debug
	*/

	server.get('/dump', function(req, res) {
		res.json(dataObj);
	});



	/*
	* matches
	*/

	server.get('/matches$', function(req, res) {
		console.log('matches', req.params);
		res.json(dataObj.matches);
	});

	const matchesByRegionId = /^\/matches\/([12])$/;
	server.get(matchesByRegionId, function(req, res) {
		const regionId = _.parseInt(req.params[0]);
		console.log('matches by regionId', regionId);

		res.json(
			_.chain(dataObj.matches)
				.filter({region: regionId})
				.indexBy('id')
				.value()
		);
	});

	const matchesByMatchId = /^\/matches\/([12]-[1-9])$/;
	server.get(matchesByMatchId, function(req, res, next) {
		const matchId = req.params[0];
		console.log('matches by matchId', matchId);
		const match = dataObj.matches[matchId];

		res.header('Last-Modified', match.lastmod * 1000);
		res.json(match);
		return next();
	});



	/*
	* matchDetails
	*/

	const detailsByMatchId = /^\/([12]-[1-9])$/;
	server.get(detailsByMatchId, function(req, res, next) {
		const matchId = req.params[0];
		console.log('details by matchId', matchId);
		const data = getDetails(matchId);

		if (data && data.match) {
			res.header('Last-Modified', data.match.lastmod * 1000);
		}
		res.json(data);
		return next();
	});

	const detailsByWorldSlug = /^\/world\/([a-z-]+)$/;
	server.get(detailsByWorldSlug, function(req, res, next) {
		const worldSlug = req.params[0];
		console.log('details by worldSlug', worldSlug);

		const world = getWorldBySlug(worldSlug);
		const match = getMatchByWorldId(world.id);

		if (match) {
			res.header('Last-Modified', match.lastmod * 1000);
			res.json(getDetails(match.id));
		}
		else {
			res.send(404, 'Not Found');
		}
		return next();
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