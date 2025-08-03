//SIMULATED FOOTBALL OF THE FANTASTICAL VARIETY
const fs = require('fs')
const {parse} = require('csv-parse/sync');
const util = require('util');

//CONSTANTS
const SHORT_STATS = ["str", "dex", "end", "int", "ego", "fte"];
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
const PITCH_SIZE = [105, 70]; //meters
const GOAL_WIDTH = 8; //meters. it's meant to be 7.32 but fuck that

//collision layers. two objects must share a layer to collide
//an object on ↓ this layer cares about ↓
const 		   L_PITCH			= 1<<1, //being offside
			   L_GOALS 			= 1<<2, //being in goal
			   L_PITCH_ZONES 	= 1<<3, //being in pitch zones like the penalty box

			   L_PLAYERS		= 1<<4, //contacting players
			   L_MISC_OBJECTS	= 1<<5, //colliding with other objects

			   LS_PHYSICAL		= L_PLAYERS | L_MISC_OBJECTS,			//all physical layers
			   LS_ZONAL			= L_PITCH | L_GOALS | L_PITCH_ZONES; 	//all zone layers



let NAMES = parse(fs.readFileSync('names.txt', {encoding: "utf8"}))[0];
//let NAMES = parse(fs.readFileSync('data/names_general.csv', {encoding: "utf8"}))[0]; //this isn't in this branch yet

const POSITION_POSITIONS = { //where do all the players go? this is home side, coordinates are flipped for the away side
	GK: [0, 35],
	CF1: [45, 25], CF2: [45, 45],
	LM: [35, 12], RM: [35, 58],
	CM1: [30, 25], CM2: [30, 45],
	LB: [20, 12], RB: [20, 58],
	CB1: [15, 25], CB2: [15, 45]
};

//FUNCTIONS

//universal distance function, handles FFObjects and vectors 
function dist(a, b) {
	let x1, y1, x2, y2;
	if (a instanceof FFObject) {x1 = a.x; y1 = a.y}
	else {x1 = a[0]; y1 = a[1]}
	if (b instanceof FFObject) {x2 = b.x; y2 = b.y}
	else {x2 = b[0]; y2 = b[1]}

	return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)

}

//accepts an array of objects with a weight attribute. picks a weighted random outcome
function rollWeights(outcomes, weightStat='weight') {
	let weightTotal = outcomes.reduce((a, b) => a + b[weightStat], initialValue=0); //sum weights of all outcomes
	if (weightTotal == 0) {console.log('tried to roll weights with no weights'); return false;}
	let roll = Math.random() * weightTotal;
	let weightCount = 0;
	for (let outcome of outcomes) {
		weightCount += outcome[weightStat];
		if (weightCount > roll) { //i.e., if the roll was between the previous outcome's weight and this one
			return outcome
		}
	}
}

//silly oneliner function that just does 4d6. create new array of 4 zeroes
function statRoll() {return new Array(4).fill(0).map((_) => Math.floor(Math.random() * 6 + 1)).sort().slice(1, 4).reduce((a, b) => a + b)}
//return {str: statRoll(), dex: statRoll(), etc}
function statSpread() {let stats = {}; for (let stat of SHORT_STATS) {stats[stat] = statRoll()}; return stats}
//return {dominance: 0.1, deflection: 2.4, distraction: 1.2, etc}
function attrSpread() {let attrs = {}; for (let attr of Object.keys(ATTRIBUTES)) {attrs[attr] = Math.random()*3}; return attrs}

//generate random name
function randomName() {return NAMES[Math.floor(Math.random() * NAMES.length)]}
//turn stat into modifier
function modifier(x) {return Math.floor((x - 10)/2)}

//CLASSES

class FFObject { //base class for physical "objects". should just be overwritten
	x = 0; dx = 0;
	y = 0; dy = 0;
	w = 0.01; h = 0.01;

	collisions = []; //stored list of colliding objects, enumerated by the Game on each tick
	layers = 0; //collision layers

	tick(game) {console.warn(`FFObject ${this} running default tick`)};

	collidingWith(that) { //check collision against one object
		if (that instanceof Zone) return that.collidingWith(this); //zones have their own implementation we should defer to
		return	this.x < that.x + that.w &&
				this.x + this.w > that.x &&
				this.y < that.y + that.h &&
				this.y + this.h > that.y
	};

	get cx() {return this.x + this.w/2}; get cy() {return this.y + this.y/2}; //center x and y
	set cx(v) {this.x = v - this.w/2};   set cy(v) {this.y = v - this.h/2};
}

class Ball extends FFObject { //a 'ball' for 'feet', as the kids call it
	possession = null;
	game = null;
	w = 0.2; h = 0.2;
	layers = L_PITCH | L_GOALS | L_PLAYERS | L_MISC_OBJECTS; //god i love flag enums

	constructor(game) {
		super();
		this.game = game;
		this.cx = PITCH_SIZE[0]/2; this.cy = PITCH_SIZE[1]/2;
	}

	tick(game) { //what's this ball doing
		this.x += this.dx; this.y += this.dy;
	}
}

class Zone extends FFObject { //an area of the pitch, used for goals, determining offsides, etc
	dx = null; dy = null;
	game = null;
	name = "Zone";
	mustContainToCollide = false; //whether this zone collides with objects not entirely within it

	constructor(game, x, y, w, h, name, layers, mustContainToCollide=false) {
		super();
		this.game = game; this.name = name; this.mustContainToCollide = mustContainToCollide;
		this.x = x; this.y = y; this.w = w; this.h = h; this.layers = layers;
	}

	collidingWith(that) { //check collision against one object
		if (this.mustContainToCollide) {
			return	this.x < that.x &&
					this.x + this.w > that.x + that.w &&
					this.y < that.y &&
					this.y + this.h > that.y + that.h
		} else {
			return	this.x < that.x + that.w &&
					this.x + this.w > that.x &&
					this.y < that.y + that.h &&
					this.y + this.h > that.y
		}
	};
}

class Team { //a 'team' of 'foot ballers', as the kids call it
	city = "Abyssal"; title = "Wanderers";
	league = "Spectral"; //eventually there will be a League class, but that's mostly going to be the purview of a different system
	game = null;
	players = [];
	side = '';

	constructor(city="Abyssal", title="Wanderers") {
		this.city = city; this.title = title;
		for (let i = 0; i < 18; i++) { //generate 18 players
			let position = i < 11 ? POSITIONS[i] : "SUB";
			this.players.push(new Player(this, position));
		}
	}

	setup(game, side) {
		this.game = game; this.side = side;
	}

	get starters() {return this.players.filter((p) => p.position != "SUB")}; //not substitutes
	get substitutes() {return this.players.filter((p) => p.position == "SUB")}; //substitutes
	get name() {return this.city + ' ' + this.title};
	get position() {return Object.fromEntries(POSITIONS.map((pos, i) => [pos, this.players[i]]))}; //team.positions.GK == team.players[0]
}

class Player extends FFObject { //a 'baller' of 'feet', as the kids call them
	first_name = "Foot"; last_name = "Baller";
	position = "SUB";
	team = null; home = "The Universe";
	stats = {}; attr_modifiers = {};
	w = 0.5; h = 0.5; layers = L_PITCH | L_PITCH_ZONES | L_PLAYERS | L_MISC_OBJECTS;

	has_ball = false;
	tactic = "neutral";

	constructor(team, position) { //mr sandman, sand me a man
		super();
		this.team = team; this.home = team.city;
		this.first_name = randomName(); this.last_name = randomName() + "son";
		this.stats = statSpread(); this.attr_modifiers = attrSpread();
		this.position = position;

		if (position == 'SUB') { //put em in gay baby jail
			this.x = this.team.side == 'home' ? -10 : PITCH_SIZE[0]+10;
			this.layers = 0;
		} else {
			this.x = POSITION_POSITIONS[position][0]; this.y = POSITION_POSITIONS[position][1];
			if (this.team.side == 'away') this.x = this.x*-1 + PITCH.SIZE[0];
		}

		return new Proxy(this, {			//frankly, this is just gross metaprogramming shit
			get (target, prop, receiver) {	//but it lets us expose properties like player.dominance without defining 16 different getters
				if (Object.keys(ATTRIBUTES).includes(prop)) { //if attribute, calculate attribute modifier:
					return target.attr_modifiers[prop] + modifier(target.stats[ATTRIBUTES[prop]]) * 1.25;
					//the multiplier here is because having modifiers be 0-10 makes the weight maths way easier
				} else {return Reflect.get(...arguments)}; //otherwise do normal getting activity
			}
		})
	};

	tick(game) { //what's this boy doing
		//...
		this.x += this.dx; this.y += this.dy;
	}

	get name() {return this.first_name + ' ' + this.last_name};

	//function so players are easier to read in console.log() entries
	[util.inspect.custom]() {return `${this.first_name} ${this.last_name} <STR ${this.stats.str} | DEX ${this.stats.dex} | END ${this.stats.end} | INT ${this.stats.int} | EGO ${this.stats.ego} | FTE ${this.stats.fte}>`}
}

//THE GAME CLASS
class Game {
	homeTeam = null; awayTeam = null;
	objects = []; zones = [];
	time = 0; //seconds

	get players() {return this.homeTeam.players.concat(this.awayTeam.players)};

	constructor(home=null, away=null) {
		this.homeTeam = home ? home : new Team();
		this.awayTeam = away ? away : new Team();
		this.objects.push(new Ball(this));

		this.homeTeam.setup(this, 'home'); this.awayTeam.setup(this, 'away');

		let homeGoal = new Zone(this, -2, PITCH_SIZE[1]-GOAL_WIDTH, 2, GOAL_WIDTH, "homeGoal", L_GOALS);
		let awayGoal = new Zone(this, PITCH_SIZE[0], PITCH_SIZE[1]-GOAL_WIDTH, 2, GOAL_WIDTH, "awayGoal", L_GOALS);
		let pitch = new Zone(this, 0, 0, PITCH_SIZE[0], PITCH_SIZE[1], "pitch", L_PITCH, true);
		this.zones = [homeGoal, awayGoal, pitch];
	}

	tick() { //the game continues
		{//[S] Collide. Do this shit in its own scope so all these variables don't go everywhere
			//Split game into four partitions, for faster colliding

			let objects = this.objects.concat(this.players).filter((o) => o.layers != 0); //get all objects including players excluding non-colliding objects
			objects.sort((a, b) => a.x - b.x); //Sort by X coordinate
			let pLength = Math.floor(objects.length/4);
			//Find boundaries of each partition, which are determined by where players are, not the size of the actual pitch.
			//Partitions will be smaller if players are bunched up, otherwise colliding would go back to being O(n^2) whenever everyone's near a goal
			let partitions = [objects[pLength].x+0.01, objects[pLength*2].x+0.01, objects[pLength*3].x+0.01, objects.at(-1).x+0.01];
			let pObjects = [[], [], [], []];

			for (let obj of objects) {
				if (! obj.layers & LS_PHYSICAL) break; //Only zonal layers (or no layers), which ignore partition so don't bother

				let left = obj.x; let right = obj.x + obj.w; //Get left and right edges
				for (let i = 0; i < 4; i++) {
					let part_right = partitions[i]; //Right edge of partition
					let part_left = partitions[i-1] ? partitions[i-1] : 0; //Left edge of partition
					if (left < part_right && left > part_left || //left or right edge is in partition
						right < part_right && right > part_left) pObjects[i].push(obj);
					else if (right < part_left) break; //remaining partitions are past this object
				}
			}

			//Collate zones per layer for faster reference
			let pitch = this.zones.find((z) => z.layers == L_PITCH);
			let pitchZones = this.zones.filter((z) => z.layers == L_PITCH_ZONES);
			let goals = this.zones.filter((z) => z.layers == L_GOALS);

			//Collide objects with zones. Ignore partitions
			for (let object of objects) {
				object.collisions = [];

				if (object.layers & L_PITCH && pitch.collidingWith(object)) {object.collisions.push(pitch); pitch.collisions.push(object);}
				if (object.layers & L_PITCH_ZONES) for (let zone of pitchZones) if (zone.collidingWith(object)) //ew!
					{object.collisions.push(zone); zone.collisions.push(object);}
				if (object.layers & L_GOALS) for (let goal of goals) if (goal.collidingWith(object)) //ew!
					{object.collisions.push(goal); goal.collisions.push(object);}
			}

			//Collide objects within partitions
			for (let partition of pObjects) {
				for (let object of partition) {
					partition.slice(partition.indexOf(object)); //remaining objects in this partition won't try and check against this one
					let valid_colliders = partition.filter((b) => object.layers & b.layers & LS_PHYSICAL); //get all objects in this partition with at least one matching physical layer
					for (let target of valid_colliders) {
						if (object.collidingWith(target)) {
							object.collisions.push(target);
							target.collisions.push(object);
						}
					}
				}
			}
		}
		//Man that was a doozy, huh
		for (let object of this.objects.concat(this.players)) {
			object.tick();
		}
	}	
}

module.exports = {
	Game: Game, Team: Team, Player: Player
}