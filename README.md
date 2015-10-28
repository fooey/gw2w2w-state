# state.gw2w2w.com

## [endpoints](https://github.com/fooey/gw2w2w-state/blob/master/routes/index.js)

- matches
	- all
		- [/matches$](http://state.gw2w2w.com/matches)
	- by region (1=NA, 2=EU)
		- [/matches/([12])$](http://state.gw2w2w.com/matches/1)
	- by match_id
		- [/matches/([12]\-[1-9])](http://state.gw2w2w.com/matches/1-1)
	- by worlds
		- [/matches/worlds](http://state.gw2w2w.com/matches/worlds)
- matchDetails
	- by match_id
		- [/([12]\-[1-9])](http://state.gw2w2w.com/1-1)
	- by [world_slug](https://github.com/fooey/gw2w2w-static/blob/master/data/world_names.js)
		- [/world/([a-z-]+)](http://state.gw2w2w.com/world/fort-aspenwood)
	- by [world_id](https://github.com/fooey/gw2w2w-static/blob/master/data/world_names.js)
		- [/world/([0-9]{4})](http://state.gw2w2w.com/world/1009)
- debug
	- all the things
		- [/dump](http://state.gw2w2w.com/dump)