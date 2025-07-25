module.exports = {
	rollWeights(outcomes, weightStat='weight') { //accepts an array of objects with a weight attribute. picks a weighted random outcome
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
}