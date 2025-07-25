const rollWeights = require("./util").rollWeights;
//States are functions that represent a specific state or step of play.
//States should return {message: "...", outcomes: [...]}, and may modify properties like game.possession, game.ball_x, and game.home/away.cohesion
module.exports = {
	pregame (game, lastState=null) {
		let state = {};

		//starting cohesion = sum of players' Collaboration, /40
		game.home.cohesion = Math.min(game.home.starters.reduce((a, b) => a + b.collaboration, initialValue=0) / 40, 1);
		game.away.cohesion = Math.min(game.away.starters.reduce((a, b) => a + b.collaboration, initialValue=0) / 40, 1);

		state.message = `${game.home.name} (c ${Math.round(game.home.cohesion*1000)}) at ${game.away.name} (c ${Math.round(game.away.cohesion*1000)}).`;

		state.outcomes = [
			{next: "home_kickoff", weight: 1},
			{next: "away_kickoff", weight: 1}
		];
		return state
	},
	home_kickoff (game, lastState) {
		let state = {};
		let kicker = rollWeights(game.home.starters, weightStat="confidence");
		state.message = `${kicker.name} kicks off for ${game.home.city}.`;
		game.possession = kicker;

		state.outcomes = [
			{next: "good_kickoff", weight: 8 + kicker.dominance * 0.8 + kicker.confidence * 0.5},
			{next: "mid_kickoff", weight: 10 + kicker.confidence * -0.6},
			{next: "poor_kickoff", weight: 5 + kicker.dominance * -0.8 + kicker.confidence * -0.3}
		];
		return state
	},
	away_kickoff (game, lastState) {
		let state = {};
		let kicker = rollWeights(game.away.starters, weightStat="confidence");
		state.message = `${kicker.name} kicks off for ${game.away.city}.`;
		game.possession = kicker;

		state.outcomes = [
			{next: "good_kickoff", weight: 8 + kicker.dominance * 0.8 + kicker.confidence * 0.5},
			{next: "mid_kickoff", weight: 10 + kicker.confidence * -0.6},
			{next: "poor_kickoff", weight: 5 + kicker.dominance * -0.8 + kicker.confidence * -0.3}
		];
		return state
	}
};