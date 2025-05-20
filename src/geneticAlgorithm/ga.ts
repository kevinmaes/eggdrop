import { clamp } from '../utils';
import type { DNA } from './DNA';
import type { PhenotypeConfig, PhenotypeKey } from './phenotype';

/** Genetic Algorithm individual of the population */
export interface Individual {
  dna: DNA;
  phenotype: Record<PhenotypeKey, number>;
  fitness: number;
}

/**
 * Selects an individual based on their relative fitness
 * using roulette wheel selection
 * @param population
 * @returns
 */
export function rouletteWheelSelection(population: Individual[]) {
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

  const lastIndividual = population[population.length - 1];
  if (lastIndividual === undefined) {
    throw new Error('Individual is undefined');
  }

  // In case of rounding errors, return the last individual
  return lastIndividual;
}

export function eliteSelection(
  population: Individual[],
  totalCount: number,
  eliteCount: number
) {
  const sortedPopulation = population.sort((a: Individual, b: Individual) => {
    return b.fitness - a.fitness;
  });
  const selectedParents = sortedPopulation.slice(0, eliteCount);
  const restPopulation = sortedPopulation.slice(eliteCount);
  for (let i = 0; i < totalCount - eliteCount; i++) {
    selectedParents.push(rouletteWheelSelection(restPopulation));
  }

  return selectedParents;
}

/**
 * Mutates an individual based on a mutation rate and variance percentage
 * @param individual
 * @param properties
 * @param mutationRate
 * @param variancePercentage
 * @returns mutated individual
 */
export function mutateIndividual<T extends Individual>(
  individual: T,
  phenotypeConfig: PhenotypeConfig,
  mutationRate: number,
  mutationVariancePercentageRate: number
): T {
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
      return mutatedValue;
    }
    // Un-mutated value
    return value;
  }

  const phenotypeKeys = Object.keys(phenotypeConfig) as PhenotypeKey[];

  const possiblyMutatedPhenotype = { ...individual.phenotype };
  // Loop over properties and mutate those values
  phenotypeKeys.forEach(key => {
    possiblyMutatedPhenotype[key] = mutateValue(key, individual.phenotype[key]);
  });

  return individual;
}
