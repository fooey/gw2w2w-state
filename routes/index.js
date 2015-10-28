
import _ from 'lodash';
import {worlds} from 'gw2w2w-static';


module.exports = function(app, express) {



    /*
     * static
     */

    app.use(express.static('public', {
        index: 'index.html'
    }));




    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });





    /*
     * debug
     */

    app.get('/dump', function(req, res) {
        return res.json(GLOBAL.data.details);
    });



    /*
     * matches
     */

    app.get('/matches$', function(req, res) {
        return res.json(GLOBAL.data.matches);
    });


    const matchesByRegionId = /^\/matches\/([12])$/;
    app.get(matchesByRegionId, function(req, res) {
        const regionId = req.params[0];
        console.log('matches by regionId', regionId);

        const regionMatches = _
            .chain(GLOBAL.data.matches)
            .filter({region: regionId})
            .indexBy('id')
            .value();

        return res.json(regionMatches);
    });


    const matchesByMatchId = /^\/matches\/([12]-[1-9])$/;
    app.get(matchesByMatchId, function(req, res) {
        const matchId = req.params[0];

        return res.json(_.get(GLOBAL.data.matches, [matchId], {}));
    });


    app.get('/matches/worlds$', function(req, res) {
        let result = _.reduce(
            GLOBAL.data.matches,
            (acc, m) => {
                ['red', 'blue', 'green'].forEach(c => acc[m.worlds[c]] = _.merge({color: c}, m));
                return acc;
            },
            {}
        );

        return res.json(result);
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

        if (!world) {
            return res.status(404).send(`Unknown WorldSlug: ${worldSlug}.\nSee https://github.com/fooey/gw2w2w-static/blob/master/data/world_names.js`);
        }

        const match = getMatchByWorldId(world.id);

        if (!match) {
            return res.status(404).send(`Match not found. Possibly match reset time, or app is not ready, try again in a few seconds`);
        }

        const matchId = match.id;

        return returnMatchDetails(matchId, req, res);
    });

    const detailsByWorldId = /^\/world\/([0-9-]{4})$/;
    app.get(detailsByWorldId, function(req, res) {
        const worldId = req.params[0];

        if (!_.has(worlds, worldId)) {
            return res.status(404).send(`Unknown worldId: ${worldId}.\nSee https://github.com/fooey/gw2w2w-static/blob/master/data/world_names.js`);
        }

        const match = getMatchByWorldId(worldId);

        if (!match) {
            return res.status(404).send(`Match not found. Possibly match reset time, or app is not ready, try again in a few seconds`);
        }

        const matchId = match.id;

        return returnMatchDetails(matchId, req, res);
    });





    function returnMatchDetails(matchId, req, res) {
        return res.json(_.get(GLOBAL.data.details, [matchId], {}));
    }



    function getWorldBySlug(worldSlug) {
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
        return _.find(GLOBAL.data.matches, function(match) {
            return (
                worldId == match.worlds.red
                || worldId == match.worlds.blue
                || worldId == match.worlds.green
            );
        });
    }

};
