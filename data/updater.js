
/*
*
*   dependencies
*
*/

import _ from 'lodash';
import moment from 'moment';
import request from 'request';





/*
*
*   module globals
*
*/

const OBJECTIVE_VALUES = {
    castle: 35,
    keep: 25,
    tower: 15,
    camp: 5,
};

const DEFAULT_HOLDINGS = {
    red: {castle: 0, keep: 0, tower: 0, camp: 0},
    blue: {castle: 0, keep: 0, tower: 0, camp: 0},
    green: {castle: 0, keep: 0, tower: 0, camp: 0},
};

const DEFAULT_TICKS = {red: 0, blue: 0, green: 0};





/*
*
*   public methods
*
*/

export function init() {
    console.log('data:update:init');
    process.nextTick(getRemote);
}





/*
*
*   private methods
*
*/

function getRemote() {
    request({
        url: `https://api.guildwars2.com/v2/wvw/matches?ids=all`,
        gzip: true,
        'User-Agent': `state.gw2w2w.com`,
    },
    (err, res, body) => {
        const data = parseJSON(body, {});
        console.log('state::update::status', res.statusCode, body.length);

        if (res.statusCode === 200 && !_.isEmpty(data)) {
            GLOBAL.data = reformatData(data);
        }
        setTimeout(getRemote, getInterval());
    });
}


function parseJSON(jsonString, defaultResult = {}) {
    try {
        return JSON.parse(jsonString);
    }
    catch (ex) {
        return defaultResult;
    }
}



function getInterval() {
    const minTime = 4;
    const maxTime = 8;

    return _.random(minTime * 1000, maxTime * 1000);
}



function reformatData(data) {
    const details = _
        .chain(data)
        .indexBy('id')
        .mapValues(
            (match) =>
            reformatMatchData(match)
        )
        .value();

    const matches = _
        .chain(details)
        .cloneDeep()
        .mapValues((m) => {
            delete m.maps;
            return m;
        })
        .value();

    const worlds = getWorldsFromMatches(matches);

    return {details, matches, worlds};
}



function reformatMatchData(match) {
    match.startTime = moment(match.start_time).unix();
    match.endTime = moment(match.end_time).unix();
    match.region = match.id[0];

    match.maps = match.maps.map((m) => reformatMapData(m));
    // match.logs = getLogs(match.logs, match.maps);

    match.lastmod = 0;
    match.holdings = _.cloneDeep(DEFAULT_HOLDINGS);
    match.ticks = _.cloneDeep(DEFAULT_TICKS);

    _.forEach(match.maps, (map) => {
        match.lastmod = Math.max(match.lastmod, map.lastmod);
        _.forEach(map.holdings, (holding, color) => {
            _.forEach(holding, (num, type) => {
                const holdingVal = _.get(match, ['holdings', color, type], 0);
                const tick = _.get(match, ['ticks', color], 0);
                const objectiveVal = _.get(OBJECTIVE_VALUES, [type], 0);

                _.set(match, ['holdings', color, type], holdingVal + num);
                _.set(match, ['ticks', color], tick + (objectiveVal * num));
            });
        });
    });

    delete match.start_time;
    delete match.end_time;

    return match;
}



function reformatMapData(map) {
    map.objectives = map.objectives.map((o) => reformatObjectiveData(o));

    map.lastmod = 0;
    map.holdings = _.cloneDeep(DEFAULT_HOLDINGS);
    map.ticks = _.cloneDeep(DEFAULT_TICKS);

    _.forEach(map.objectives, (o) => {
        const holding = _.get(map, ['holdings', o.owner, o.type], 0);
        const tick = _.get(map, ['ticks', o.owner], 0);
        const objectiveVal = _.get(OBJECTIVE_VALUES, [o.type], 0);

        map.lastmod = Math.max(map.lastmod, o.lastmod);
        _.set(map, ['holdings', o.owner, o.type], holding + 1);
        _.set(map, ['ticks', o.owner], tick + objectiveVal);
    });

    delete map.bonuses;

    return map;
}



function reformatObjectiveData(o) {
    o.lastFlipped = (moment(o.last_flipped).isValid()) ? moment(o.last_flipped).unix() : null;
    o.lastClaimed = (moment(o.claimed_at).isValid()) ? moment(o.claimed_at).unix() : null;
    o.lastmod = Math.max(o.lastFlipped, o.lastClaimed);
    o.owner = o.owner.toLowerCase();
    o.guild = o.claimed_by;
    o.type = o.type.toLowerCase();

    // if (o.lastClaimed) {
    //  console.log(o.lastClaimed);
    // }
    // if (o.guild) {
    //  console.log(o.guild);
    // }

    delete o.last_flipped;
    delete o.claimed_at;
    delete o.claimed_by;

    return o;
}



function getWorldsFromMatches(matches) {
    return _.reduce(
        matches,
        (acc, m) => {
            ['red', 'blue', 'green'].forEach(
                (c) => acc[m.worlds[c]] = m.id
            );
            return acc;
        },
        {}
    );
}


// function getLogs(logs = [], maps) {
//     const logsLastmod = _.max(logs, 'lastmod').lastmod || 0;

//     const newObjectives = _
//         .chain(maps)
//         .pluck('objectives')
//         .flatten()
//         .filter(o => o.lastmod > logsLastmod)
//         .sortBy('lastmod')
//         .value();

//     return logs.concat(newObjectives);
// };
