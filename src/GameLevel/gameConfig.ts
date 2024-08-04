export const LEVEL_DURATION_MS = 30_000;
export const POPULATION_SIZE = 1;
export const STAGE_DIMENSIONS = { width: 1920, height: 1080 };
export const CHEF_CONFIG = {
	x: STAGE_DIMENSIONS.width / 2 - 0.5 * 250,
	y: STAGE_DIMENSIONS.height - 303 - 10,
	width: 250,
	height: 303,
};
export const CHEF_POT_RIM_CONFIG = {
	width: 0.5 * CHEF_CONFIG.width,
	height: 25,
	xOffset: 30,
	y: CHEF_CONFIG.y + 220,
};

export const HEN_Y_POSITION = 10;
export const STAGGERED_HEN_DELAY_MS = 1000;

export function getInitialChromosomeValues() {
	const minX = Math.random() * 0.4 * STAGE_DIMENSIONS.width;
	const maxX = STAGE_DIMENSIONS.width - minX;
	const minStopMS = Math.ceil(Math.random() * 1000);
	const maxStopMS = minStopMS + Math.random() * 5000;

	return {
		speed: Math.random() * 1.2,
		baseTweenDurationSeconds: Math.ceil(Math.random() * 10),
		maxEggs: -1,
		stationaryEggLayingRate: 1, // Math.random(),
		movingEggLayingRate: 1, // Math.random(),
		hatchRate: Math.random(),
		minX,
		maxX,
		minStopMS,
		maxStopMS,
	};
}
