import { IndividualHen, IndividualHenChromosomeKey } from './GameLevel/types';

export function calculateFitness(individual: IndividualHen) {
	// Default overall fitness can not be 0
	let overallFitness = 0.1;

	// Punish hens that lay no eggs
	if (individual.eggsLaid === 0) {
		return overallFitness;
	}

	// Reward hens that lay more eggs
	overallFitness += individual.eggsLaid / 10;

	const eggsCaughtTotal =
		individual.eggsCaught.white +
		individual.eggsCaught.gold +
		individual.eggsCaught.black;

	const caughtRate = eggsCaughtTotal / individual.eggsLaid;
	overallFitness += 1 - caughtRate;

	// TODO: Add a reward if black eggs were caught.
	const blackEggCaughtRate = individual.eggsCaught.black / individual.eggsLaid;
	overallFitness += blackEggCaughtRate;

	return overallFitness;
}

/**
 * Selects an individual based on their relative fitness
 * using roulette wheel selection
 * @param population
 * @returns
 */
export function rouletteWheelSelection(population: IndividualHen[]) {
	// Calculate the total fitness of the population
	const totalFitness = population.reduce(
		(acc, individual) => acc + individual.fitness,
		0
	);

	// Generate a random number between 0 and the total fitness
	let rand = Math.random() * totalFitness;

	// Iterate through the population and select an individual based on the random number
	for (let individual of population) {
		rand -= individual.fitness;
		if (rand <= 0) {
			return individual;
		}
	}

	// In case of rounding errors, return the last individual
	return population[population.length - 1];
}

/**
 * Mutates an individual based on a mutation rate and variance percentage
 * @param individual
 * @param properties
 * @param mutationRate
 * @param variancePercentage
 * @returns mutated individual
 */
export function mutate(
	individual: IndividualHen,
	properties: IndividualHenChromosomeKey[],
	mutationRate: number,
	variancePercentage: number
): IndividualHen {
	function mutateValue(value: number): number {
		if (Math.random() < mutationRate) {
			const variance = (variancePercentage / 100) * value;
			return value + Math.random() * 2 * variance - variance;
		}
		return value;
	}

	// Loop over properties and mutate those values
	properties.forEach((property) => {
		individual[property] = mutateValue(individual[property]);
	});

	return individual;
}
