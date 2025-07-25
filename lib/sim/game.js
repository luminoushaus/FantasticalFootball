const {Team, Player} = require('./types');
const STATES = require('./states');
const rollWeights = require('./util').rollWeights;

module.exports = class {
	home = null;
	away = null;
	time = 0;
	state = null;

	possession = null; //will point to the posessing player
	ball_x = 0; //+1 is the away team's goal, -1 is the home team's goal

	constructor () {
		this.home = new Team();
		this.away = new Team();
		this.state = STATES.pregame(this);
	}

	//process one step of gameplay
	step () {
		let lastState = this.state;
		this.time += 1;

		//pick next state
		this.state = STATES[rollWeights(lastState.outcomes).next](this, lastState);
		console.log(this.state.message);
	}
}