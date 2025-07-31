//sim object types
const fs = require('fs')
const {parse} = require('csv-parse/sync');
const util = require('util');

const STAT_NAMES = ["str", "dex", "end", "int", "ego", "fte"];
const LONG_STATS = ["Strength", "Dexterity", "Endurance", "Intelligence", "Ego", "Fate"];
const POSITIONS = ["GK", "CF1", "CF2", "LM", "CM1", "CM2", "RM", "LB", "CB1", "CB2", "RB"];
const ATTRIBUTES = {
	dominance: "str", deflection: "str", distraction: "str",
	aerodynamics: "dex", agility: "dex", acrobatics: "dex",
	stamina: "end", survival: "end", steadfast: "end",
	perception: "int", precision: "int", precognition: "int",
	confidence: "ego", collaboration: "ego", composure: "ego",
	luck: "fte"
};
const PITCH_SIZE = [105, 70]; //in meters
const POSITION_COORDINATES = {
	GK: [0, 35],
}

//let NAMES = parse(fs.readFileSync('names.txt', {encoding: "utf8"}))[0];
let NAMES = parse(fs.readFileSync('../../names.txt', {encoding: "utf8"}))[0];
//let NAMES = parse(fs.readFileSync('data/names_general.csv', {encoding: "utf8"}))[0]; //this isn't in this branch yet

//silly oneliner function that just does 4d6. create new array of 4 zeroes
function statRoll() {return new Array(4).fill(0).map((_) => Math.floor(Math.random() * 6 + 1)).sort().slice(1, 4).reduce((a, b) => a + b)}
//return {str: statRoll(), dex: statRoll(), etc}
function statSpread() {let stats = {}; for (let stat of STAT_NAMES) {stats[stat] = statRoll()}; return stats}
//return {dominance: 0.1, deflection: 2.4, distraction: 1.2, etc}
function attrSpread() {let attrs = {}; for (let attr of Object.keys(ATTRIBUTES)) {attrs[attr] = Math.random()*3}; return attrs}

//generate random name
function randomName() {return NAMES[Math.floor(Math.random() * NAMES.length)]}
//turn stat into modifier
function modifier(x) {return Math.floor((x - 10)/2)}

class Team {
	city = "Asrith";
	title = "Adventurers";
	league = "Wide World";
	game = null;
	players = [];

	constructor (game) {
		this.game = game;
		for (let i = 0; i < 18; i++) { //generate 18 players
			let position = i < 11 ? POSITIONS[i] : "SUB";
			this.players.push(new Player(this, position));
		}
	}

	get starters() {return this.players.filter((p) => p.position != "SUB")}; //not substitutes
	get substitutes() {return this.players.filter((p) => p.position == "SUB")}; //substitutes
	get name() {return this.city + ' ' + this.title};
	get opposition() {return this.game.home == this ? this.game.away : this.game.home}; //enemy team
	get positions() {return Object.fromEntries(POSITIONS.map((pos, i) => [pos, this.players[i]]))}; //team.positions.GK == team.players[0]
}

class FFObject {
	x = 0; dx = 0;
	y = 0; dy = 0;

	distance(target) {return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2)};
}

class Ball extends FFObject {
	game = null;
	possession = null;

	constructor (game) {
		this.game = game;
	}

	tick () {
		this.x += this.dx; this.y += this.dy;	
	}
}

class Player extends FFObject {
	first_name = "Foot";
	last_name = "Baller";
	position = "SUB";
	team = null;
	home = "The Universe";
	stats = {};
	attr_modifiers = {};

	has_ball = false;
	tactic = "neutral";

	constructor (team, position) {
		this.team = team;
		this.home = team.city;
		this.first_name = randomName();
		this.last_name = randomName() + "son";
		this.stats = statSpread();
		this.attr_modifiers = attrSpread();
		this.position = position;

		return new Proxy(this, {			//frankly, this is just gross metaprogramming shit
			get (target, prop, receiver) {	//but it lets us expose properties like player.dominance without defining 16 different getters
				if (Object.keys(ATTRIBUTES).includes(prop)) { //if attribute, calculate attribute modifier:
					return target.attr_modifiers[prop] + modifier(target.stats[ATTRIBUTES[prop]]) * 1.25;
					//the multiplier here is because having modifiers be 0-10 makes the weight maths way easier
				} else {return Reflect.get(...arguments)}; //otherwise do normal getting activity
			}
		})
	};

	tick () {
		//...
		this.x += this.dx; this.y += this.dy;
	}

	get name() {return this.first_name + ' ' + this.last_name};

	//function so players are easier to read in console.log() entries
	[util.inspect.custom]() {return `${this.first_name} ${this.last_name} <STR ${this.stats.str} | DEX ${this.stats.dex} | END ${this.stats.end} | INT ${this.stats.int} | EGO ${this.stats.ego} | FTE ${this.stats.fte}>`}
}

module.exports = {
	Team: Team, Player: Player, Ball: Ball
};