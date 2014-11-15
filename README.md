# state.gw2w2w.com

## [endpoints](https://github.com/fooey/gw2w2w-state/blob/master/routes/index.js)

- matches
	- all
		- [http://state.gw2w2w.com/matches$](/matches)
	- by region (1=NA, 2=EU)
		- [http://state.gw2w2w.com/matches/([12])$](/matches/1)
	- by match_id
		- [http://state.gw2w2w.com/matches/([12]\-[1-9])](/matches/1-1)
- matchDetails
	- by match_id
		- [http://state.gw2w2w.com/([12]\-[1-9])](/1-1)
	- by [world_slug](https://github.com/fooey/gw2w2w-static/blob/master/data/world_names.js)
		- [http://state.gw2w2w.com/world/([a-z-]+)](/world/sea-of-sorrows)
- debug
	- all the things
		- [http://state.gw2w2w.com/dump](/dump)