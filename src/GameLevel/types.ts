export interface Position {
	x: number;
	y: number;
}

export interface GenerationStats {
	averageEggsBroken: number;
	averageEggsHatched: number;
	averageEggsLaid: number;
	averageHenSpeedLimit: number;
	generationIndex: number;
	totalEggsBroken: number;
	totalEggsCaught: number;
	totalEggsHatched: number;
	totalEggsLaid: number;
	catchRate: number;
	// other averages here
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
	hatchRate: number;
	// Results
	fitness: number;
	eggsLaid: number;
	eggsCaught: number;
	eggsHatched: number;
	eggsBroken: number;
}
