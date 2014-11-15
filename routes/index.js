'use strict';

const _ = require('lodash');
const worlds = require('gw2w2w-static').worlds;

module.exports = function(app, express) {
	app.use(express.static(process.cwd() + '/public'));


	app.use('/dump', function(req, res) {
		res.send(GLOBAL.data);
	});

	app.use('/matches$', function(req, res) {
		console.log('matches', req.params);
		res.send(GLOBAL.data.matches);
	});
	app.use('/matches/:regionId([12])$', function(req, res) {
		console.log('matches by regionId', req.params);

		const regionId = _.parseInt(req.params.regionId);

		res.send(
			_.chain(GLOBAL.data.matches)
				.filter({region: regionId})
				.indexBy('id')
				.value()
		);
	});
	app.use('/matches/:matchId([12]\-[1-9])', function(req, res) {
		console.log('matches by matchId', req.params);
		res.send(GLOBAL.data.matches[req.params.matchId]);
	});

	app.use('/:matchId([12]\-[1-9])', function(req, res) {
		console.log('details by matchId', req.params);

		res.send(getDetails(req.params.matchId));
	});


	app.use('/world/:worldSlug([a-z-]+)', function(req, res) {
		console.log('details by worldSlug', req.params);

		const worldSlug = req.params.worldSlug;
		const world = _.find(worlds, function(world) {
			return (
				world.en.slug === worldSlug
				|| world.es.slug === worldSlug
				|| world.de.slug === worldSlug
				|| world.fr.slug === worldSlug
			);
		});
		const match = _.find(GLOBAL.data.matches, function(match) {
			return (
				world.id == match.redId
				|| world.id == match.blueId
				|| world.id == match.greenId
			);
		});

		if (match) {
			res.send(getDetails(match.id));
		}
		else {
			res.send({});
		}

	});
};


function getDetails(matchId) {
	return {
		now: Date.now(),
		match: GLOBAL.data.matches[matchId],
		details: GLOBAL.data.details[matchId],
	};
}
