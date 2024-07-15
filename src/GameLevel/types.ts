export interface Position {
	x: number;
	y: number;
}

export interface HenStats {
	id: string;
	eggsLayed: number;
	eggsCaught: number;
	eggsHatched: number;
	eggsBroken: number;
}

export interface GenerationStats {
	averageEggsBroken: number;
	averageEggsHatched: number;
	averageEggsLayed: number;
	averageEggsSplat: number;
	averageHenSpeedLimit: number;
	generationIndex: number;
	totalEggsBroken: number;
	totalEggsCaught: number;
	totalEggsHatched: number;
	totalEggsLayed: number;
	// other averages here
}
