const Game = require('./game');

let game = new Game();
game.away.city = "Swallowed City"; game.away.title = "Sorcerers";
console.log(game.state.message);
game.step();