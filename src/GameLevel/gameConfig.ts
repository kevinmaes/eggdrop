// This file contains the configuration for the game

export function getGameConfig() {
	const stageDimensions = {
		width: 1280,
		height: 720,
		margin: 10,
		movementMargin: 25,
	};

	// The position and dimensions of the chef
	const chefWidth = 344;
	const chefHeight = 344;
	const chefYPosition =
		stageDimensions.height - chefHeight - stageDimensions.margin;

	// The duration in seconds for the egg to fall from the hen to the ground
	// Somewhere between 0.25 and 0.75 is reasonable.
	const eggFallingSpeed = 0.5;

	const henSize = 120;

	const gameConfig = {
		isMuted: true,
		// The number of hens in the game
		populationSize: 10,
		// The duration each level lasts in milliseconds
		levelDurationMS: 3_000,
		stageDimensions: {
			...stageDimensions,
			midX: stageDimensions.width / 2,
			midY: stageDimensions.height / 2,
		},
		colors: {
			primaryYellow: '#fceb50',
			primaryOrange: '#e7af37',
			secondaryOrange: '#c69334',
			primaryBlue: '#a5c4fa',
			secondaryBlue: '#455579',
		},
		chef: {
			x: stageDimensions.width / 2,
			y: chefYPosition,
			width: chefWidth,
			height: chefHeight,
			speedLimit: 20,
			// Keep the acceleration low so that tapping the arrow keys doesn't
			// make the chef move too quickly and a small movement is possible.
			acceleration: 2,
			// Keep the deceleration is higher than the acceleration so the character
			// can "stop on a dime"
			deceleration: 7,
			minXPos: 0.5 * chefWidth,
			// Right margin is reduced so that the pot can still catch eggs at the edge of the screen
			maxXPos: stageDimensions.width - 0.5 * chefWidth,
			potRim: {
				width: 150,
				height: 30,
				// x distance from the chef's x position
				offsetX: 30,
				y: chefYPosition + 240,
			},
		},
		hen: {
			width: henSize,
			height: henSize,
			offstageLeftX: -henSize,
			offstageRightX: stageDimensions.width + henSize,
			y: -10,
			// The delay between each hen entering the stage
			staggeredEntranceDelay: 2000,
			buttXOffset: 0.5 * henSize,
			buttYOffset: 85,
		},
		henBeam: {
			width: stageDimensions.width,
			height: 35,
			x: 0,
			y: 98,
		},
		egg: {
			fallingSpeed: eggFallingSpeed,
			// Create a var EGG_FALLING_DURATION that is a number from 1 to 5 where 1 is the same as eggFallingSpeed equal to 0.5
			// and 5 is the same as eggFallingSpeed equal to 0.1
			fallingDuration: 5 - 4 * eggFallingSpeed,
			points: {
				white: 1,
				gold: 10,
				black: -5,
			},
			fallingEgg: {
				width: 30,
				height: 30,
			},
			brokenEgg: {
				width: 60,
				height: 60,
			},
			chick: {
				width: 60,
				height: 60,
			},
		},
		countdownTimer: {
			width: 100,
			height: 50,
		},
	};

	// Set the audio mute according to the isMuted value
	Howler.mute(gameConfig.isMuted);

	return gameConfig;
}

/**
 * Sets up initial chromosome values for the hens.
 * Establishes the initial variation for the hen population.
 * @returns
 */
export function getInitialChromosomeValues() {
	const gameConfig = getGameConfig();

	const totalMovementRange =
		gameConfig.stageDimensions.width -
		2 * gameConfig.stageDimensions.movementMargin;

	// The minimum xPos the hen can be at
	let minX =
		Math.round(Math.random() * 0.25 * totalMovementRange) +
		gameConfig.stageDimensions.movementMargin;

	// The maximum xPos the hen can be at
	let maxX = gameConfig.stageDimensions.width - minX - gameConfig.hen.width;

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
		speed: Math.random(),

		// baseTweenDurationSeconds is the base duration for the tween
		// baseTweenDurationSeconds: Math.ceil(Math.random() * 5),
		baseTweenDurationSeconds: 1,

		// maxEggs can range between -1 and 50, -1 means no limit
		// maxEggs: Math.round(Math.random() * 51) - 1,
		maxEggs: -1,

		// The rate at which the hen lays eggs while stopped
		// stationaryEggLayingRate: Math.random(),
		stationaryEggLayingRate: 1,

		// The rate at which the hen lays eggs while moving
		// movingEggLayingRate: Math.random(),
		movingEggLayingRate: 0,

		// The time the hen will rest after laying an egg
		restAfterLayingEggMS: Math.random() * 2000,

		// Egg color rates
		blackEggRate,
		goldEggRate,

		// The rate at which the eggs will hatch when they land on the ground
		// hatchRate: Math.random(),
		hatchRate: 1,

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
