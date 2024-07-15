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
	generationIndex: number;
	totalEggsCaught: number;
	averageEggsLayed: number;
	averageEggsHatched: number;
	averageEggsSplat: number;
	averageEggsBroken: number;
	averageHenSpeedLimit: number;
	// other averages here
}
