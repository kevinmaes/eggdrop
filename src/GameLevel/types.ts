import type { Position } from '../types';
import { DNA } from '../geneticAlgorithm/DNA';
import type { PhenotypeKey } from '../geneticAlgorithm/phenotype';

export interface GenerationStats {
	// Overall info
	generationNumber: number;
	catchRate: number;
	averageFitness: number;

	// Average phenotype values
	averageHenSpeed: number;
	averageBaseTweenDurationSeconds: number;
	averageStationaryEggLayingRate: number;
	averageMovingEggLayingRate: number;
	averageHatchRate: number;
	averageMinXMovement: number;
	averageMaxXMovement: number;
	averageMinStopMS: number;
	averageMaxStopMS: number;
	averageMaxEggs: number;
	averageBlackEggRate: number;
	averageGoldEggRate: number;
	averageRestAfterLayingEggMS: number;

	// Average stats
	averageEggsBroken: number;
	averageEggsHatched: number;
	averageEggsLaid: number;

	// Result totals
	totalEggsBroken: number;
	totalEggsCaught: number;
	totalBlackEggsCaught: number;
	totalGoldEggsCaught: number;
	totalWhiteEggsCaught: number;
	totalEggsHatched: number;
	totalEggsLaid: number;
	totalBlackEggsLaid: number;
	totalGoldEggsLaid: number;
	totalWhiteEggsLaid: number;
}

export interface LevelResults {
	generationNumber: number;
	scoreData: {
		levelScore: number;
		eggsCaught: {
			white: number;
			gold: number;
			black: number;
		};
	};
	levelStats: GenerationStats;
	henStatsById: Record<string, Hendividual>;
}

// TODO: Move to a dictionary for any egg stats related data collection.
// All stats can be derived by filtering dictonary values.
// type EggStatsDictionary = Record<
// 	string,
// 	{
// 		generationIndex: number;
// 		henId: string;
// 		eggId: string;
// 		eggColor: string;
// 		eggEvent: 'laid' | 'caught' | 'hatched' | 'broken';
// 	}
// >;

export interface Hendividual {
	id: string;
	// GA
	dna: DNA;
	phenotype: Record<PhenotypeKey, number>;
	fitness: number;
	// Configuration
	initialPosition: Position;

	// Results
	stats: {
		eggsLaid: number;
		eggsCaught: {
			white: number;
			gold: number;
			black: number;
		};
		eggsHatched: number;
		eggsBroken: number;
	};
}
