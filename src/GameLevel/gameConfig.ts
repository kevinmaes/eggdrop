// This file contains the configuration for the game

// The duration of each level in milliseconds
export const LEVEL_DURATION_MS = 60_000;

// The number of hens in the game
export const POPULATION_SIZE = 10;

// The dimensions of the stage
export const STAGE_DIMENSIONS = { width: 1280, height: 720 };

// The position and dimensions of the chef
export const CHEF_CONFIG = {
	x: STAGE_DIMENSIONS.width / 2 - 0.5 * 250,
	y: STAGE_DIMENSIONS.height - 303 - 10,
	width: 250,
	height: 303,
};

// The dimensions and position of the chef pot rim (catches eggs)
export const CHEF_POT_RIM_CONFIG = {
	width: 0.5 * CHEF_CONFIG.width,
	height: 25,
	xOffset: 30,
	y: CHEF_CONFIG.y + 220,
};

// The yPosition of the hens
export const HEN_Y_POSITION = 10;

// The delay between each hen entering the stage
export const STAGGERED_HEN_DELAY_MS = 1000;

export function getInitialChromosomeValues() {
	// The minimum xPos the hen can be at
	let minX = Math.round(Math.random() * STAGE_DIMENSIONS.width);

	// The maximum xPos the hen can be at
	let maxX = Math.round(Math.random() * STAGE_DIMENSIONS.width);

	if (minX > maxX) {
		[minX, maxX] = [maxX, minX];
	}
	console.log('minX/maxX', minX, maxX, maxX - minX);

	// The minimum time the hen will stop at a location
	const minStopMS = Math.ceil(Math.random() * 1000);

	// The maximum time the hen will stop at a location
	const maxStopMS = minStopMS + Math.random() * 5000;

	return {
		// speed is the x speed of the hen
		speed: Math.random() * 3,

		// baseTweenDurationSeconds is the base duration for the tween
		baseTweenDurationSeconds: Math.ceil(Math.random() * 10),

		// maxEggs can range between -1 and 50, -1 means no limit
		maxEggs: Math.round(Math.random() * 51) - 1,
		// maxEggs: -1,

		// The rate at which the hen lays eggs while stopped
		stationaryEggLayingRate: Math.random(),
		// stationaryEggLayingRate: 0,

		// The rate at which the hen lays eggs while moving
		movingEggLayingRate: Math.random(),
		// movingEggLayingRate: 1,

		// The time the hen will rest after laying an egg
		restAfterLayingEggMS: Math.random() * 2000,

		// The rate at which the eggs will hatch when they land on the ground
		hatchRate: Math.random(),
		// hatchRate: 1,

		// The minimum xPos the hen can be at
		minX,

		// The maximum xPos the hen can be at
		maxX,

		// The minimum time the hen will stop at a location
		minStopMS,

		// The maximum time the hen will stop at a location
		maxStopMS,
	};
}
