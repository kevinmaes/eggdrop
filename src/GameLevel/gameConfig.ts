export const LEVEL_DURATION_MS = 30_000;
export const POPULATION_SIZE = 10;
export const STAGE_DIMENSIONS = { width: 1920, height: 1080 };
export const CHEF_DIMENSIONS = { width: 224, height: 150 };
export const CHEF_POT_RIM_CONFIG = {
	width: 0.8 * CHEF_DIMENSIONS.width,
	height: 25,
	y: STAGE_DIMENSIONS.height - 0.7 * CHEF_DIMENSIONS.height,
};

export const HEN_Y_POSITION = 10;
export const STAGGERED_HEN_DELAY_MS = 1000;

export function getInitialChromosomeValues() {
	const minX = Math.random() * 0.4 * STAGE_DIMENSIONS.width;
	const maxX = STAGE_DIMENSIONS.width - minX;
	const minStopMS = 1000; // Math.ceil(Math.random() * 1000);
	const maxStopMS = 1000; // minStopMS + Math.random() * 5000;

	return {
		// speed: Math.random() * 1.2,
		speed: Math.random() * 2, // + 0.5,
		// speed: 2,
		baseTweenDurationSeconds: Math.ceil(Math.random() * 10),
		maxEggs: -1,
		stationaryEggLayingRate: Math.random(),
		// stationaryEggLayingRate: 0,
		movingEggLayingRate: Math.random(), // * 0.5,
		// movingEggLayingRate: 1,
		hatchRate: Math.random(),
		// hatchRate: 1,
		minX,
		maxX,
		minStopMS,
		maxStopMS,
	};
}
