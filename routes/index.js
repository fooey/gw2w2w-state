
import _ from 'lodash';

import {worlds as WORLDS} from 'gw2w2w-static';
const WORLD_SLUGS = getWorldsBySlug(WORLDS);


module.exports = function(app, express) {




    /*
     * CORS
     */

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });




    /*
     * static
     */

    app.use(express.static('public', {
        index: 'index.html'
    }));



    app.get(
        '/favicon.ico',
        (req, res) => res.redirect(301, '/gw2-dragon-32.png')
    );





    /*
     * debug
     */

    app.get(
        '/dump',
        (req, res) => res.json(GLOBAL.data)
    );





    /*
     * worlds
     */

    app.get(
        '/worlds',
        (req, res) => res.json(GLOBAL.data.worlds)
    );



    app.get(
        '/worldslugs',
        (req, res) => res.json(WORLD_SLUGS)
    );




    /*
     * matches
     */

    app.get(
        '/matches$',
        (req, res) => res.json(GLOBAL.data.matches)
    );



    const matchesByRegionId = /^\/matches\/([12])$/;
    app.get(matchesByRegionId, (req, res) => {
        const regionId = req.params[0];
        // console.log('matches by regionId', regionId);

        const regionMatches = _
            .chain(GLOBAL.data.matches)
            .filter({region: regionId})
            .indexBy('id')
            .value();

        return res.json(regionMatches);
    });



    const matchesByMatchId = /^\/matches\/([12]-[1-9])$/;
    app.get(matchesByMatchId, (req, res) => {
        const matchId = req.params[0];

        if (_.has(GLOBAL.data.matches, [matchId])) {
            return res.json(_.get(GLOBAL.data.matches, [matchId], {}));
        }
        else {
            return res.status(404).send(`Match not found: ${matchId}. Possibly match reset time, or app is not ready, try again in a few seconds`);
        }
    });



    app.get('/matches/worlds$', (req, res) => {
        let result = _.reduce(
            GLOBAL.data.matches,
            (acc, m) => {
                ['red', 'blue', 'green'].forEach(
                    c => acc[m.worlds[c]] = _.merge({color: c}, m)
                );
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
    app.get(detailsByMatchId, (req, res) => {
        const matchId = req.params[0];

        if (_.has(GLOBAL.data.details, [matchId])) {
            return res.json(_.get(GLOBAL.data.details, [matchId], {}));
        }
        else {
            return res.status(404).send(`Match not found: ${matchId}. Possibly match reset time, or app is not ready, try again in a few seconds`);
        }
    });



    const detailsByWorldSlug = /^\/world\/([a-z-]+)$/;
    app.get(detailsByWorldSlug, (req, res) => {
        const worldSlug = req.params[0];
        const world = getWorldBySlug(worldSlug);

        if (!world) {
            return res.status(404).send(`Unknown WorldSlug: ${worldSlug}.\nSee https://github.com/fooey/gw2w2w-static/blob/master/data/world_names.js`);
        }

        const matchDetails = getDetailsByWorldId(world.id);

        if (matchDetails) {
            return res.json(matchDetails);
        }
        else {
            return res.status(404).send(`Match not found: ${matchId}. Possibly match reset time, or app is not ready, try again in a few seconds`);
        }
    });



    const detailsByWorldId = /^\/world\/([0-9-]{4})$/;
    app.get(detailsByWorldId, (req, res) => {
        const worldId = req.params[0];

        if (!_.has(WORLDS, worldId)) {
            return res.status(404).send(`Unknown worldId: ${worldId}.\nSee https://github.com/fooey/gw2w2w-static/blob/master/data/world_names.js`);
        }

        const matchDetails = getDetailsByWorldId(worldId);

        if (matchDetails) {
            return res.json(matchDetails);
        }
        else {
            return res.status(404).send(`Not found. Possibly match reset time, or app is not ready, try again in a few seconds`);
        }
    });

};






/*
 * helpers
 */


function getWorldBySlug(worldSlug) {
    const worldId = _.get(WORLD_SLUGS, worldSlug);

    return _.get(WORLDS, worldId);
}



function getMatchByWorldId(worldId) {
    const matchId = _.get(GLOBAL.data.worlds, worldId);
    const match = _.get(GLOBAL.data.matches, matchId);

    return match;
}



function getDetailsByWorldId(worldId) {
    const matchId = _.get(GLOBAL.data.worlds, worldId);
    const details = _.get(GLOBAL.data.details, matchId);

    return details;
}



function getWorldsBySlug(worlds) {
    return _.reduce(
        worlds,
        (acc, world) => {
            acc[world.en.slug] = world.id;
            acc[world.es.slug] = world.id;
            acc[world.de.slug] = world.id;
            acc[world.fr.slug] = world.id;
            return acc;
        },
        {}
    )
}
