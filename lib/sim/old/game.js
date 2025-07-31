//Sim main game code.
const {Team, Player, Ball} = require('./types');
const rollWeights = require('./util').rollWeights;

module.exports = class {
	home = null;
	away = null;
	ball = null;
	time = 0;

	constructor () {
		this.home = new Team(this);
		this.away = new Team(this);
		this.ball = new Ball(this);

		this.home.cohesion = Math.min(game.home.starters.reduce((a, b) => a + b.collaboration, initialValue=0) / 4, 1);
		this.away.cohesion = Math.min(game.away.starters.reduce((a, b) => a + b.collaboration, initialValue=0) / 4, 1);

		//this doesn't go anywhere yet
		let message = `${game.home.name} (c ${Math.round(game.home.cohesion*1000)/100}) at ${game.away.name} (c ${Math.round(game.away.cohesion*1000)/100}).`;
	}

	get players() {return this.home.players.concat(this.away.players)};

	//process one tick of gameplay
	tick () {
		this.time += 1;
		ball.tick();
		for (let player in this.players) player.tick();
	}
}