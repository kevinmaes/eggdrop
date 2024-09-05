import type { Position } from '../types';
import { DNA, type PhenotypeKey } from '../types/dna';

export interface GenerationStats {
	// Averages
	averageEggsBroken: number;
	averageEggsHatched: number;
	averageEggsLaid: number;
	averageHenSpeed: number;
	averageStationaryEggLayingRate: number;
	averageHatchRate: number;
	averageMinXMovement: number;
	averageMaxXMovement: number;
	averageMinStopMS: number;
	averageMaxStopMS: number;
	// Results
	generationNumber: number;
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
	catchRate: number;
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
	henStatsById: Record<string, IndividualHen>;
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

export interface IndividualHen {
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
