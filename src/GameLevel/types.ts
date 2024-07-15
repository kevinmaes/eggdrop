export interface Position {
	x: number;
	y: number;
}

export interface GenerationStats {
	averageEggsBroken: number;
	averageEggsHatched: number;
	averageEggsLaid: number;
	averageEggsSplat: number;
	averageHenSpeedLimit: number;
	generationIndex: number;
	totalEggsBroken: number;
	totalEggsCaught: number;
	totalEggsHatched: number;
	totalEggsLaid: number;
	// other averages here
}

export interface IndividualHen {
	id: string;
	// Configuration
	initialPosition: Position;
	speed: number;
	baseAnimationDuration: number;
	maxEggs: number;
	stationaryEggLayingRate: number;
	movingEggLayingRate: number;
	// Results
	fitness: number;
	eggsLaid: number;
	eggsCaught: number;
	eggsHatched: number;
	eggsBroken: number;
}
