import { getGameConfig } from '../GameLevel/gameConfig';
import { mapValue } from '../utils';

export const phenotypeConfig = {
	// The x speed of the hen
	speed: {
		min: 0,
		max: 1,
	},
	// The base duration for the hen's tween
	baseTweenDurationSeconds: {
		min: 0,
		max: 5,
		round: true,
	},
	// The maximum number of eggs the hen can lay while stopped
	stationaryEggLayingRate: {
		min: 0,
		max: 0.5,
	},
	// The maximum number of eggs the hen can lay while moving
	movingEggLayingRate: {
		min: 0,
		max: 0.5,
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
		max: getGameConfig().stageDimensions.width,
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
		max: 0.5,
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

export type PhenotypeConfig = typeof phenotypeConfig;
export type PhenotypeKey = keyof typeof phenotypeConfig;
export type PhenotypeValuesForIndividual = Record<PhenotypeKey, number>;

export class DNA {
	private genes: number[];
	constructor(length: number) {
		this.genes = [];
		for (let i = 0; i < length; i++) {
			this.genes.push(Math.random());
		}
	}

	getLength() {
		return this.genes.length;
	}

	getGene(index: number) {
		return this.genes[index] ?? 0;
	}

	replaceGenes(genes: number[]) {
		this.genes = genes;
	}
}

type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T];

function typedEntries<T extends Record<string, any>>(obj: T): Entries<T>[] {
	return Object.entries(obj) as Entries<T>[];
}

export function getPhenotypeConfig() {
	return typedEntries(phenotypeConfig);
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

export function getInitialPhenotype(dna: DNA) {
	const config = getPhenotypeConfig();
	let phenotypeValues: Partial<PhenotypeValuesForIndividual> = {};
	let i = 0;
	for (const [key, value] of config) {
		const gene = dna.getGene(i);
		phenotypeValues[key] = getPhenotypeValue(gene, value);
	}
	return phenotypeValues as PhenotypeValuesForIndividual;
}