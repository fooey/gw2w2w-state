
/*
*
*   dependencies
*
*/

import _ from 'lodash';
import moment from 'moment';
import request from 'superagent';





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
    request
        .get('https://api.guildwars2.com/v2/wvw/matches?ids=all')
        .set('User-Agent', 'state.gw2w2w.com')
        .end((err, res) => {
            // console.log('state::update::status', res.status);

            if(res.status === 200) {
                GLOBAL.data = reformatData(res.body);
            }
            setTimeout(getRemote, getInterval());
        });
}



function getInterval() {
    const minTime = 2;
    const maxTime = 4;

    return _.random(minTime * 200, maxTime * 1000);
}



function reformatData(data) {
    const details = _
        .chain(data)
        .map(match => reformatMatchData(match))
        .indexBy('id')
        .value();

    const matches = _
        .chain(details)
        .cloneDeep()
        .map(m => {
            delete m.maps;
            return m;
        })
        .indexBy('id')
        .value();

    const worlds = getWorldsFromMatches(matches);

    return {details, matches, worlds};
}



function reformatMatchData(match) {
    match.startTime = moment(match.start_time).unix();
    match.endTime = moment(match.end_time).unix();
    match.region = match.id[0];

    match.maps = match.maps.map(m => reformatMapData(m));
    // match.logs = getLogs(match.logs, match.maps);

    match.lastmod = 0;
    match.holdings = _.cloneDeep(DEFAULT_HOLDINGS);
    match.ticks = _.cloneDeep(DEFAULT_TICKS);

    _.forEach(match.maps, (map, key) => {
        match.lastmod = Math.max(match.lastmod, map.lastmod);
        _.forEach(map.holdings, (holding, color) => {
            _.forEach(holding, (val, type) => {
                match.holdings[color][type] += val;
                match.ticks[color] += (OBJECTIVE_VALUES[type] * val);
            });
        });
    });

    delete match.start_time;
    delete match.end_time;

    return match;
}



function reformatMapData(map) {
    map.objectives = map.objectives.map(o => reformatObjectiveData(o));

    map.lastmod = 0;
    map.holdings = _.cloneDeep(DEFAULT_HOLDINGS);
    map.ticks = _.cloneDeep(DEFAULT_TICKS);

    _.forEach(map.objectives, o => {
        map.lastmod = Math.max(map.lastmod, o.lastmod);
        map.holdings[o.owner][o.type] += 1;
        map.ticks[o.owner] += OBJECTIVE_VALUES[o.type];
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
                c => acc[m.worlds[c]] = m.id
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
