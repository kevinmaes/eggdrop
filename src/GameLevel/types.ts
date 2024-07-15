export interface Position {
	x: number;
	y: number;
}

export interface HenStats {
	id: string;
	eggsLaid: number;
	eggsCaught: number;
	eggsHatched: number;
	eggsBroken: number;
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
	initialPosition: Position;
	speed: number;
	baseAnimationDuration: number;
	maxEggs: number;
	stationaryEggLayingRate: number;
	movingEggLayingRate: number;
}
