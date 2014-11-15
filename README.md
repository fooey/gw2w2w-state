# state.gw2w2w.com

## [endpoints](https://github.com/fooey/gw2w2w-state/blob/master/routes/index.js)

- matches
	- [/matches$](/matches)
		- all matches
	- [/matches/([12])$](/matches/1)
		- matches by region (1=NA, 2=EU)
	- [/matches/([12]\-[1-9])](/matches/1-1)
- matchDetails
	- [/([12]\-[1-9])](/1-1)
		- details by match_id
	- [/world/([a-z-]+)](/world/sea-of-sorrows)
		- details by [world_slug](https://github.com/fooey/gw2w2w-static/blob/master/data/world_names.js)
- debug
	- [/dump](/dump)
		- all the things