// This file contains the configuration for the game

// The duration of each level in milliseconds
export const LEVEL_DURATION_MS = 20_000;

// The number of hens in the game
export const POPULATION_SIZE = 20;

// The dimensions of the stage
export const STAGE_DIMENSIONS = { width: 1280, height: 720 };
const STAGE_MARGIN = 10;

// The position and dimensions of the chef
const chefScale = 0.7;
const chefWidth = 250 * chefScale;
const chefHeight = 303 * chefScale;
export const CHEF_CONFIG = {
	x: STAGE_DIMENSIONS.width / 2 - 0.5 * chefWidth,
	y: STAGE_DIMENSIONS.height - chefHeight - STAGE_MARGIN,
	width: chefWidth,
	height: chefHeight,
	speedLimit: 20,
	// Keep the acceleration low so that tapping the arrow keys doesn't
	// make the chef move too quickly and a small movement is possible.
	acceleration: 2,
	// Keep the deceleration is higher than the acceleration so the character
	// can "stop on a dime"
	deceleration: 7,
	minXPos: STAGE_MARGIN,
	// Right margin is reduced so that the pot can still catch eggs at the edge of the screen
	maxXPos: STAGE_DIMENSIONS.width - chefWidth - 0.5 * STAGE_MARGIN,
};

// The dimensions and position of the chef pot rim (catches eggs)
export const CHEF_POT_RIM_CONFIG = {
	width: 0.6 * CHEF_CONFIG.width,
	height: 15,
	xOffset: 15,
	y: CHEF_CONFIG.y + 155,
};

// The yPosition of the hens
export const HEN_Y_POSITION = 10;

// The delay between each hen entering the stage
export const STAGGERED_HEN_DELAY_MS = 1000;

// The duration in seconds for the egg to fall from the hen to the ground
// Somewhere between 0.1 and 0.5 is reasonable.
const EGG_FALLING_SPEED = 0.2;

// Create a var EGG_FALLING_DURATION that is a number from 1 to 5 where 1 is the same as EGG_FALLING_SPEED equal to 0.5
// and 5 is the same as EGG_FALLING_SPEED equal to 0.1
const EGG_FALLING_DURATION = 5 - 4 * EGG_FALLING_SPEED;

export const EGG_CONFIG = {
	fallingSpeed: EGG_FALLING_SPEED,
	fallingDuration: EGG_FALLING_DURATION,
	points: {
		white: 1,
		gold: 10,
	},
	brokenEgg: {
		width: 50,
		height: 42,
	},
	chick: {
		width: 60,
		height: 60,
	},
};

/**
 * Sets up initial chromosome values for the hens.
 * Establishes the initial variation for the hen population.
 * @returns
 */
export function getInitialChromosomeValues() {
	// The minimum xPos the hen can be at
	let minX = Math.round(Math.random() * STAGE_DIMENSIONS.width);

	// The maximum xPos the hen can be at
	let maxX = Math.round(Math.random() * STAGE_DIMENSIONS.width);

	if (minX > maxX) {
		[minX, maxX] = [maxX, minX];
	}

	// The minimum time the hen will stop at a location
	const minStopMS = Math.ceil(Math.random() * 1000);

	// The maximum time the hen will stop at a location
	const maxStopMS = minStopMS + Math.random() * 5000;

	// Egg color
	const maxBlackEggRate = 0.5;
	const blackEggRate = Math.floor(Math.random() * maxBlackEggRate * 100) / 100;
	const goldEggRateRandom = 1 - Math.random() * (1 - blackEggRate);
	const goldEggRate = Math.floor(goldEggRateRandom * 100) / 100;

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
		// stationaryEggLayingRate: 1,

		// The rate at which the hen lays eggs while moving
		movingEggLayingRate: Math.random(),
		// movingEggLayingRate: 0,

		// The time the hen will rest after laying an egg
		restAfterLayingEggMS: Math.random() * 2000,

		// Egg color rates
		blackEggRate,
		goldEggRate,

		// The rate at which the eggs will hatch when they land on the ground
		// hatchRate: Math.random(),
		hatchRate: 0.5,

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
