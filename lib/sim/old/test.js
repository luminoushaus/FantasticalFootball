const Game = require('./game');
const util = require('./util');

let game = new Game();
game.away.city = "Swallowed City"; game.away.title = "Sorcerers";

function loopStep() {
	console.log(game.state.message);
	game.step();
	setTimeout(loopStep, 3000);
}

//loopStep();