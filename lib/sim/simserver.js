const sim = require('./sim');
const { performance } = require('perf_hooks');

let game = new sim.Game(new sim.Team("Asrith", "Adventurers"), new sim.Team("Swallowed City", "Sorcerers"));

const startTime = performance.now();
game.tick();
const endTime = performance.now();

console.log(`Tick speed: ${endTime-startTime}ms`);