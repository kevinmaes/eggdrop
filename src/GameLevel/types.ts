import { Position } from '../types';

export interface GenerationStats {
	// Averages
	averageEggsBroken: number;
	averageEggsHatched: number;
	averageEggsLaid: number;
	averageHenSpeed: number;
	averageStationaryEggLayingRate: number;
	averageHatchRate: number;
	averageMinX: number;
	averageMaxX: number;
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
	minX: number;
	maxX: number;
	minStopMS: number;
	maxStopMS: number;
	// Results
	fitness: number;
	eggsLaid: number;
	eggsCaught: number;
	eggsHatched: number;
	eggsBroken: number;
}

export type IndividualHenChromosomeKey =
	| 'speed'
	| 'baseTweenDurationSeconds'
	| 'stationaryEggLayingRate'
	| 'movingEggLayingRate'
	| 'hatchRate'
	| 'minX'
	| 'maxX'
	| 'minStopMS'
	| 'maxStopMS';
