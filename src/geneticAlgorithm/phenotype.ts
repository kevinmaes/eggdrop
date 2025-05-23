import { getGameConfig } from '../GameLevel/gameConfig';
import { mapValue } from '../utils';

// This is the definitive list of all the possible phenotypes
// that can be used to configure the Hendividuals.
export type PhenotypeKey =
  | 'speed'
  | 'baseTweenDurationSeconds'
  | 'stationaryEggLayingRate'
  | 'movingEggLayingRate'
  | 'hatchRate'
  | 'minXMovement'
  | 'maxXMovement'
  | 'minStopMS'
  | 'maxStopMS'
  | 'maxEggs'
  | 'blackEggRate'
  | 'goldEggRate'
  | 'restAfterLayingEggMS';

export type PhenotypeConfig = Record<
  PhenotypeKey,
  {
    min: number;
    max: number;
    round?: boolean;
  }
>;
export type PhenotypeValuesForIndividual = Record<PhenotypeKey, number>;

export const phenotypeConfig: PhenotypeConfig = {
  // The x speed of the hen
  speed: {
    min: 0,
    max: 1,
  },
  // The base duration for the hen's tween
  baseTweenDurationSeconds: {
    min: 0,
    max: 7,
    round: true,
  },
  // The maximum number of eggs the hen can lay while stopped
  stationaryEggLayingRate: {
    min: 0,
    max: 0.7,
  },
  // The maximum number of eggs the hen can lay while moving
  movingEggLayingRate: {
    min: 0,
    max: 0.7,
  },
  // The rate at which the eggs will hatch when they land on the ground
  // TODO: Not sure this is needed here.
  hatchRate: {
    min: 0,
    max: 1,
  },
  // The min x amount a hen can move during its animation
  minXMovement: {
    min: 50,
    max: 200,
    round: true,
  },
  // The max x amount a hen can move during its animation
  maxXMovement: {
    min: 250,
    max: 0.5 * getGameConfig().stageDimensions.width,
    round: true,
  },
  // The min time the hen will stop at a location
  minStopMS: {
    min: 0,
    max: 1000,
    round: true,
  },
  // The max time the hen will stop at a location
  maxStopMS: {
    min: 0,
    max: 5000,
    round: true,
  },
  // The maximum number of eggs the hen can lay
  maxEggs: {
    min: 1,
    max: 10,
    round: true,
  },

  // Rate in which the hen will lay black eggs
  blackEggRate: {
    min: 0,
    max: 0.3,
  },
  // Rate in which the hen will lay gold eggs if not already laying black eggs
  goldEggRate: {
    min: 0,
    max: 0.5,
  },

  // The time the hen will rest after laying an egg (while stationary)
  restAfterLayingEggMS: {
    min: 0,
    max: 2000,
    round: true,
  },
};

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

function typedEntries<T extends Record<string, any>>(obj: T): Entries<T>[] {
  return Object.entries(obj) as Entries<T>[];
}

export function getPhenotypeValue(
  gene: number,
  phenotypeConfigValue: (typeof phenotypeConfig)[keyof typeof phenotypeConfig]
) {
  const value = mapValue(
    gene,
    0,
    1,
    phenotypeConfigValue.min,
    phenotypeConfigValue.max
  );

  if ('round' in phenotypeConfigValue && phenotypeConfigValue.round) {
    return Math.round(value);
  }
  return value;
}

/**
 * Create an actual phenotype for an individual based on its genes
 * and the phenotype config.
 * @param dna The DNA of the individual which has a genes array
 * @param phenotypeConfig The configuration for the phenotype
 * @returns An object with phenotype values for the individual
 */
export function createPhenotypeForIndividual(
  genes: number[],
  phenotypeConfig: PhenotypeConfig
) {
  const configEntries = typedEntries(phenotypeConfig);
  let phenotypeValues: Partial<PhenotypeValuesForIndividual> = {};
  let i = 0;
  for (const [key, value] of configEntries) {
    const gene = genes[i];
    if (gene === undefined) {
      throw new Error(`Gene ${i} is undefined`);
    }
    phenotypeValues[key] = getPhenotypeValue(gene, value);
  }
  return phenotypeValues as PhenotypeValuesForIndividual;
}
