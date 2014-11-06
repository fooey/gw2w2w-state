'use strict';
var _ = require('lodash');

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

		res.send({
			match: GLOBAL.data.matches[req.params.matchId],
			details: GLOBAL.data.details[req.params.matchId],
		});
	});


	app.use('/world/:worldSlug([a-z-]+)', function(req, res) {
		console.log('details by worldSlug', req.params);

		const worldSlug = req.params.worldSlug;
		const worlds = require('gw2w2w-static').worlds;
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
			res.send({
				match: GLOBAL.data.matches[match.id],
				details: GLOBAL.data.details[match.id],
			});
		}
		else {
			res.send({});
		}

	});
};
