export interface Position {
	x: number;
	y: number;
}

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
	generationIndex: number;
	totalEggsBroken: number;
	totalEggsCaught: number;
	totalEggsHatched: number;
	totalEggsLaid: number;
	catchRate: number;
}

export interface LevelResults {
	generationIndex: number;
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
