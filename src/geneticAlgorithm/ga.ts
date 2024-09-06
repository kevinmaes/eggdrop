import type { Hendividual } from '../GameLevel/types';
import { clamp } from '../utils';
import type { PhenotypeConfig, PhenotypeKey } from './phenotype';

/**
 * Selects an individual based on their relative fitness
 * using roulette wheel selection
 * @param population
 * @returns
 */
export function rouletteWheelSelection(population: Hendividual[]) {
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
export function mutateIndividual(
	individual: Hendividual,
	phenotypeConfig: PhenotypeConfig,
	mutationRate: number,
	mutationVariancePercentageRate: number
): Hendividual {
	function mutateValue(key: PhenotypeKey, value: number): number {
		if (Math.random() < mutationRate) {
			const variance = mutationVariancePercentageRate * value;
			let mutatedValue = value + Math.random() * 2 * variance - variance;
			if ('round' in phenotypeConfig[key] && phenotypeConfig[key].round) {
				mutatedValue = Math.round(
					clamp(
						mutatedValue,
						phenotypeConfig[key].min,
						phenotypeConfig[key].max
					)
				);
			}
		}
		// Un-mutated value
		return value;
	}

	const phenotypeKeys = Object.keys(phenotypeConfig) as PhenotypeKey[];

	const possiblyMutatedPhenotype = { ...individual.phenotype };
	// Loop over properties and mutate those values
	phenotypeKeys.forEach((key) => {
		possiblyMutatedPhenotype[key] = mutateValue(key, individual.phenotype[key]);
	});

	return individual;
}
