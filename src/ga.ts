import { IndividualHen } from './GameLevel/types';

export function calculateFitness(individual: IndividualHen) {
	let overallFitness = 0;

	const caughtRate = individual.eggsCaught / individual.eggsLaid;
	individual.fitness = 1 - caughtRate;

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
	properties: Array<
		Extract<
			keyof IndividualHen,
			| 'speed'
			| 'baseTweenDurationSeconds'
			| 'maxEggs'
			| 'stationaryEggLayingRate'
			| 'movingEggLayingRate'
		>
	>,
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

/**
 * Generates the next generation of the population
 * @param population - The current population array
 * @param mutationRate - The rate at which mutations occur
 * @param variancePercentage - The percentage variance for mutations
 * @returns The next generation population array
 */
// export function generateNextGeneration(
// 	population: IndividualHen[],
// 	mutationRate: number,
// 	variancePercentage: number
// ): IndividualHen[] {
// 	const nextGeneration: IndividualHen[] = [];
// 	const populationSize = population.length;

// 	// Calculate fitness for each individual
// 	population.forEach((individual) => {
// 		calculateFitness(individual);
// 	});

// 	// Create the next generation
// 	while (nextGeneration.length < populationSize) {
// 		// Select parents
// 		const parent1 = rouletteWheelSelection(population);
// 		const parent2 = rouletteWheelSelection(population);

// 		// Create offspring via crossover (simple one-point crossover example)
// 		const crossoverPoint = Math.floor(
// 			Math.random() * Object.keys(parent1).length
// 		);
// 		const offspring1: IndividualHen = { ...parent1 };
// 		const offspring2: IndividualHen = { ...parent2 };

// 		Object.keys(parent1).forEach((key: string, index) => {
// 			if (index > crossoverPoint) {
// 				offspring1[key] = parent2[key];
// 				offspring2[key] = parent1[key];
// 			}
// 		});

// 		// Mutate offspring
// 		const propertiesToMutate: Array<
// 			Extract<keyof IndividualHen, 'speed' | 'baseTweenDurationSeconds'>
// 		> = ['speed', 'baseTweenDurationSeconds'];
// 		const mutatedOffspring1 = mutate(
// 			offspring1,
// 			propertiesToMutate,
// 			mutationRate,
// 			variancePercentage
// 		);
// 		const mutatedOffspring2 = mutate(
// 			offspring2,
// 			propertiesToMutate,
// 			mutationRate,
// 			variancePercentage
// 		);

// 		// Add offspring to the next generation
// 		nextGeneration.push(mutatedOffspring1, mutatedOffspring2);
// 	}

// 	// In case of an odd number population, slice the array to maintain the original size
// 	return nextGeneration.slice(0, populationSize);
// }
