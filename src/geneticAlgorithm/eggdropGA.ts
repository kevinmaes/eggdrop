import type { Hendividual } from '../GameLevel/types';

export function calculateFitness(individual: Hendividual) {
	// Default overall fitness can not be 0
	let overallFitness = 0.1;

	// Punish hens that lay no eggs
	if (individual.stats.eggsLaid === 0) {
		return overallFitness;
	}

	// Reward hens that lay more eggs
	overallFitness += individual.stats.eggsLaid / 10;

	const eggsCaughtTotal =
		individual.stats.eggsCaught.white +
		individual.stats.eggsCaught.gold +
		individual.stats.eggsCaught.black;

	const caughtRate = eggsCaughtTotal / individual.stats.eggsLaid;
	overallFitness += 1 - caughtRate;

	// TODO: Add a reward if black eggs were caught.
	const blackEggCaughtRate =
		individual.stats.eggsCaught.black / individual.stats.eggsLaid;
	overallFitness += blackEggCaughtRate;

	return overallFitness;
}
