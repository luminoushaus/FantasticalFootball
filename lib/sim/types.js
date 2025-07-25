const STAT_NAMES = ["str", "dex", "end", "int", "ego", "fte"];
const LONG_STATS = ["Strength", "Dexterity", "Endurance", "Intelligence", "Ego", "Fate"];
const ATTRIBUTES = {
	dominance: "str", deflection: "str", distraction: "str",
	aerodynamics: "dex", agility: "dex", acrobatics: "dex",
	stamina: "end", survival: "end", steadfast: "end",
	perception: "int", precision: "int", precognition: "int",
	confidence: "ego", collaboration: "ego", composure: "ego",
	luck: "fte"
}
const fs = require('fs')
const {parse} = require('csv-parse/sync');
const util = require('util');
let NAMES = parse(fs.readFileSync('names.txt', {encoding: "utf8"}))[0];

//silly oneliner function that just does 4d6. create new array of 4 zeroes
function statRoll() {return new Array(4).fill(0).map((_) => Math.floor(Math.random() * 6 + 1)).sort().slice(1, 4).reduce((a, b) => a + b)}
//return {str: statRoll(), dex: statRoll(), etc}
function statSpread() {let stats = {}; for (let stat of STAT_NAMES) {stats[stat] = statRoll()}; return stats}
//return {dominance: 0.1, deflection: 2.4, distraction: 1.2, etc}
function attrSpread() {let attrs = {}; for (let attr of Object.keys(ATTRIBUTES)) {attrs[attr] = Math.random()*3}; return attrs}

function name() {return NAMES[Math.floor(Math.random() * NAMES.length)]}

function modifier(x) {return Math.floor((x - 10)/2)}

class Team {
	city = "Asrith";
	title = "Adventurers";
	league = "Wide World";
	players = [];

	//in game, represents a team's overall defensive or offensive positioning, relative to the ball.
	//on defense, a high cohesion team is holding good positions around the posessing player, blocking forward players, etc. increases chances to take possession & fumble dribbling
	//			  a low cohesion team is wide open, and is likely to lose ground to passes or long shots.
	//on offense, a high cohesion team is well set-up for forward progress and passing, and has good angles on the goal. increases chances to make good passes and gain distance
	//			  a low cohesion team is out of place to take advantage of possession, and is likely to lose the ball in short order.
	cohesion = 0.5;

	constructor () {
		for (let i = 0; i < 18; i++) { //generate 18 players
			this.players.push(new Player(this.city));
		}
	}

	get starters() {return this.players.slice(0, 11)}; //first 11 players
	get substitutes() {return this.players.slice(11, 18)}; //remaining 7 players
	get name() {return this.city + ' ' + this.title};
}

class Player {
	first_name = "Foot";
	last_name = "Baller";
	position = "Striker";
	home = "";
	stats = {};
	attr_modifiers = {};

	constructor (home) {
		this.home = home
		this.first_name = name();
		this.last_name = name() + "son";
		this.stats = statSpread();
		this.attr_modifiers = attrSpread();

		return new Proxy(this, {			//frankly, this is just gross metaprogramming shit
			get (target, prop, receiver) {	//but it lets us expose properties like player.dominance without defining 16 different getters
				if (Object.keys(ATTRIBUTES).includes(prop)) { //if attribute, calculate attribute modifier:
					return target.attr_modifiers[prop] + modifier(target.stats[ATTRIBUTES[prop]]);
				} else {return Reflect.get(...arguments)}; //otherwise do normal getting activity
			}
		})
	};

	get name() {return this.first_name + ' ' + this.last_name};

	//function so players are easier to read in console.log() entries
	[util.inspect.custom]() {return `${this.first_name} ${this.last_name} <STR ${this.stats.str} | DEX ${this.stats.dex} | END ${this.stats.end} | INT ${this.stats.int} | EGO ${this.stats.ego} | FTE ${this.stats.fte}>`}
}

module.exports = {
	Team: Team, Player: Player
};