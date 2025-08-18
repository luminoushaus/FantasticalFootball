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

function objOrVec(value) { //convert an object's position to a vector, or return a passed vector
	return value instanceof FFObject ? [value.x, value.y] : value;
}

//universal distance function, handles FFObjects and vectors 
function distance(a, b) {
	let [x1, y1, x2, y2] = objOrVec(a).concat(objOrVec(b)); //very silly declaration. basically turning a and b into [a.x, a.y, b.x, b.y] and populating that straight into x1, y1, x2, y2
	return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

//universal direction function, handles FFObjects and vectors. returns a unit vector
function direction(a, b) {
	let [x1, y1, x2, y2] = objOrVec(a).concat(objOrVec(b)); //very silly declaration 2
	let theta = Math.atan((x1-x2)/(y1-y2));
	return [Math.cos(theta), Math.sin(theta)];
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
//add a prototype'd weight to a function so you can use em in rollWeights
function weightFunc(f, weight) {f.prototype.weight = weight; return f}
//vector maths
function vAdd(a, b) {return [a[0]+b[0], a[1]+b[1]]};
function vSub(a, b) {return [a[0]-b[0], a[1]-[1]]};
function vVMult(a, b) {return [a[0]*b[0], a[1]*[1]]};
function vMult(v, f) {return [v[0]*f, v[1]*f]};
function vDiv(v, f) {return [v[0]/f, v[1]/f]};

//dont run off the pitch
function pitchClamp(vector) {return [Math.max(0, Math.min(vector[0], PITCH_SIZE[0])), Math.max(0, Math.min(vector[1], PITCH_SIZE[1]))]}


//CLASSES

class FFObject { //base class for physical "objects". should just be overwritten
	x = 0; y = 0; //x: 0 is home side, x: 105 is away side
	active = true;

	tick(game) {console.warn(`FFObject ${this} running default tick`)};
	distance(object) {return distance(this, object)};
	direction(object) {return direction(this, target)}
	goTo(x, y) {this.x = x; this.y = y;}
	move(x, y) {this.x += x; this.y += y;}
}

class Ball extends FFObject { //a 'ball' for 'feet', as the kids call it
	dx = 0; dy = 0;
	possession = null;
	game = null;

	constructor(game) { //place in centre of fieldc
		super();
		this.game = game;
		this.x = PITCH_SIZE[0]/2; this.cy = PITCH_SIZE[1]/2;
	}

	tick(game) { //what's this ball doing
		this.x += this.dx; this.y += this.dy;
	}
}

class Zone extends FFObject { //an area of the pitch, used for goals, determining offsides, etc
	w = 0; h = 0; //xy is top left corner
	game = null;
	name = "Zone";
	checks_for = null;

	cached_contents = [];
	last_cache = -1; //game.time that the last objectsContained ran at

	constructor(game, x, y, w, h, name, checks_for=[FFObject]) { //checks_for should be array of types
		super();
		this.game = game; this.name = name; this.checks_for = checks_for;
		this.x = x; this.y = y; this.w = w; this.h = h;
	};

	contains(object) {
		return object.x > this.x && object.x < this.x + this.w && object.y > this.y && object.y < this.y + this.h;
	};

	objectsContained() {
		if (this.last_cache == this.game.time) {return this.cached_contents};
		let results = [];
		for (let object of this.game.objects) if (this.checks_for.reduce((a, b) => a || object instanceof b, initialValue=false)) {
			results.push(object);
		}

		this.last_cache = this.game.time; this.cached_contents = results;
		return results
	}
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
		for (let player of this.players) player.setup();
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

	state = "passive";
	has_ball = false;

	constructor(team, position) { //mr sandman, sand me a man
		super();
		this.team = team; this.home = team.city;
		this.first_name = randomName(); this.last_name = randomName() + "son";
		this.stats = statSpread(); this.attr_modifiers = attrSpread();
		this.position = position;

		//attributes are normally 0-8 (or technically, like, -1-8, if you're especially dogshit) but this makes em 0-10 for easier maths
		return new Proxy(this, {			//frankly, this is just gross metaprogramming shit
			get (target, prop, receiver) {	//but it lets us expose properties like player.dominance without defining 16 different getters
				if (Object.keys(ATTRIBUTES).includes(prop)) { //if attribute, calculate attribute modifier:
					return target.attr_modifiers[prop] + modifier(target.stats[ATTRIBUTES[prop]]) * 1.25;
				} else {return Reflect.get(...arguments)}; //otherwise do normal getting activity
			}
		})
	}

	setup() { //put this man on the field, now that they know where their team goes
		if (this.position == 'SUB') { //put em in gay baby jail
			this.x = this.team.side == 'home' ? -10 : PITCH_SIZE[0]+10; this.y = Math.floor(Math.random()*PITCH_SIZE[1]);
			this.active = 0; this.state = "inactive";
		} else {
			this.x = POSITION_POSITIONS[this.position][0]; this.y = POSITION_POSITIONS[this.position][1];
			if (this.team.side == 'away') this.x = this.x*-1 + PITCH_SIZE[0];
		}
	}

	tick(game) { //what's this boy doing
		if (this.state == "passive") {
			let move_vector = vMult(this.direction(this.stand_position), Math.min(this.speed, this.distance(this.stand_position))); //don't overshoot
			this.move(move_vector);
		}
	}

	get stand_position() {
		if (!this.active) {return [0, 0]};
		let base_position = POSITION_POSITIONS[this.position];
		let our_progress = this.team.side == 'home' ? this.team.game.homeProgress : this.team.game.awayProgress;

		//if ball effectively in our goal, stand at 1/4 of the base position away from our goal. if ball in theirs, stand almost double your base position away
		let x_factor = 0.25 + our_progress * 1.5;
		let rby = this.team.game.ball.y - PITCH_SIZE[1]/2; //relative ball y
		let ball_y_factor = 1 + rby*0.2 //go 20% left or right based on where ball goes
		let prog_y_factor = 1 - our_progress < 0.2 ? (0.2 - our_progress) * 1.5 : //0-0.3 if within 20% of goal
								our_progress > 0.8 ? (our_progress - 0.8) * 2 : 0; //0-0.4 if within 20% of other goal

		let target_position = pitchClamp(vVMult(base_position, [x_factor, ball_y_factor * prog_y_factor]));

		if (this.team.side == 'away') target_position = vAdd(vVMult(target_position, [-1, 0]), [PITCH_SIZE[0], 0]);
		return target_position;
	}

	get name() {return this.first_name + ' ' + this.last_name};
	get speed() {return 5 + this.aerodynamics/2.5}; //speed between 5m/s and 9m/s, which is a bit slower than the fastest 100m speeds clocked by pro footballers

	//function so players are easier to read in console.log() entries
	[util.inspect.custom]() {return `${this.first_name} ${this.last_name} <STR ${this.stats.str} | DEX ${this.stats.dex} | END ${this.stats.end} | INT ${this.stats.int} | EGO ${this.stats.ego} | FTE ${this.stats.fte}>`}
}

//THE GAME CLASS
class Game {
	homeTeam = null; awayTeam = null;
	objects = []; zones = [];
	time = 0; //each tick is three seconds in real time

	activePlayer = null;
	ball = null;

	get players() {return this.homeTeam.players.concat(this.awayTeam.players)};
	get homeProgress() {return this.ball.x/PITCH_SIZE[0];}
	get awayProgress() {return 1-this.ball.x/PITCH_SIZE[0];}

	constructor(home=null, away=null) {
		this.homeTeam = home ? home : new Team();
		this.awayTeam = away ? away : new Team();
		this.ball = new Ball(this);
		this.objects.push(this.ball);

		this.homeTeam.setup(this, 'home'); this.awayTeam.setup(this, 'away');

		let homeGoal = new Zone(this, -2, PITCH_SIZE[1]-GOAL_WIDTH, 2, GOAL_WIDTH, "homeGoal");
		let awayGoal = new Zone(this, PITCH_SIZE[0], PITCH_SIZE[1]-GOAL_WIDTH, 2, GOAL_WIDTH, "awayGoal");
		let pitch = new Zone(this, 0, 0, PITCH_SIZE[0], PITCH_SIZE[1], "pitch");
		this.zones = [homeGoal, awayGoal, pitch];

		this.homeTeam.position.CF1.goTo(PITCH_SIZE[0]/2, PITCH_SIZE[1]/2);
		this.setActive(this.homeTeam.position.CF1);
	}

	setActive(player) { //set a new active player
		if (this.activePlayer) this.activePlayer.state = 'passive';
		player.state = 'active';
		this.activePlayer = player;
	}

	tick() { //the game continues
		let actor = this.activePlayer;
		if (actor.has_ball) {this.ball.goTo(actor.x, actor.y)};
		rollWeights(
			weightFunc(function() { //shoot ball

			}, 5 + actor.confidence + actor.dominance),
			weightFunc(function() { //pass ball

			}, 8 + actor.collaboration + actor.precognition)
		)
		for (let object of this.objects.concat(this.players)) {
			object.tick();
		}
	}	
}

module.exports = {
	Game: Game, Team: Team, Player: Player
}