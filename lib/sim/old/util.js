//Sim utility functions

/*
//The rough physical locations of each position, for determining valid players for plays
//Prevents shit like the centre forwards passing to the goalkeeper and making ground
//Coordinates are [x, y]. X=0 is the goalkeeper, X=1 is the centre forwards, Y=0 and Y=1 are the left and right midfielders
const POSITIONS = ["GK", "CF1", "CF2", "LM", "CM1", "CM2", "RM", "LB", "CB1", "CB2", "RB"];
const LOCATIONS = {
	GK: [0, 0.5],
	CF1: [1, 0.3], CF2: [1, 0.7],
	LM: [0.7, 0], RM: [0.7, 1],
	CM1: [0.6, 0.3], CM2: [0.6, 0.7],
	LB: [0.3, 0], RB: [0.3, 1],
	CB1: [0.2, 0.3], CB2: [0.2, 0.7]
};
const ATTRIBUTES = [
	"dominance", "deflection", "distraction",
	"aerodynamics", "agility", "acrobatics",
	"stamina", "survival", "steadfast",
	"perception", "precision", "precognition",
	"confidence", "collaboration", "composure",
	"luck"
]
*/
function rollWeights(outcomes, weightStat='weight') { //accepts an array of objects with a weight attribute. picks a weighted random outcome
	let weightTotal = outcomes.reduce((a, b) => a + b[weightStat], initialValue=0); //sum weights of all outcomes
	let roll = Math.random() * weightTotal;
	let weightCount = 0;
	for (let outcome of outcomes) {
		weightCount += outcome[weightStat];
		if (weightCount > roll) { //i.e., if the roll was between the previous outcome's weight and this one
			return outcome
		}
	}
}
/*

//choose a player for a play based on supplied conditions
//conditions = {
	//team: 'friend/foe',	//choose team, compared to origin player [mandatory]
	//distance: 0.5,		//ideal distance for the chosen player from the origin player (max weight 10) [optional]
	//[attribute]: 0.2,	//multiplier of the supplied attribute to add to the weight for choosing a player [optional]
//}
function choosePlayer(origin, conditions) {
	let game = origin.team.game;
	let players = conditions.team == 'friend' ? origin.team.players : origin.team.opposition.players;
	players = players.filter((p) => p.position != "SUB");
	let weightedPlayers = players.map((player) => ({
		player: player,
		weight: ('distance' in conditions? 1 - Math.abs(playerDistance(origin, player) - conditions.distance) : 0)*10 + //calculate 'distance' from condition.distance
			ATTRIBUTES.reduce((a, att) => a + (att in conditions? player[att] * conditions[att] : 0), initialValue = 0) + 0.001 //weight all attributes on player and sum
	}));
	console.log(weightedPlayers);
	return rollWeights(weightedPlayers).player;
}
*/
module.exports = {rollWeights/*, choosePlayer*/}