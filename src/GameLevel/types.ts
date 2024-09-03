import { Position } from '../types';

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
	// Configuration
	initialPosition: Position;
	speed: number;
	baseTweenDurationSeconds: number;
	maxEggs: number;
	stationaryEggLayingRate: number;
	movingEggLayingRate: number;
	restAfterLayingEggMS: number;
	blackEggRate: number;
	goldEggRate: number;
	hatchRate: number;
	minXMovement: number;
	maxXMovement: number;
	minStopMS: number;
	maxStopMS: number;
	// Results
	fitness: number;
	eggsLaid: number;
	eggsCaught: {
		white: number;
		gold: number;
		black: number;
	};
	eggsHatched: number;
	eggsBroken: number;
}

export type IndividualHenChromosomeKey =
	| 'speed'
	| 'baseTweenDurationSeconds'
	| 'stationaryEggLayingRate'
	| 'movingEggLayingRate'
	| 'hatchRate'
	| 'minXMovement'
	| 'maxXMovement'
	| 'minStopMS'
	| 'maxStopMS';
