export const LEVEL_DURATION_MS = 30_000;
export const POPULATION_SIZE = 1;
export const STAGE_DIMENSIONS = { width: 1920, height: 1080 };
export const CHEF_DIMENSIONS = { width: 224, height: 150 };
export const CHEF_POT_RIM_CONFIG = {
	width: 0.8 * CHEF_DIMENSIONS.width,
	height: 25,
	y: STAGE_DIMENSIONS.height - 0.7 * CHEF_DIMENSIONS.height,
};

export const HEN_Y_POSITION = 10;
// export const STAGGERED_HEN_DELAY_MS = 8000;
export const STAGGERED_HEN_DELAY_MS = 1000;

export function getInitialChromosomeValues() {
	const minX = Math.random() * 0.4 * STAGE_DIMENSIONS.width;
	const maxX = STAGE_DIMENSIONS.width - minX;
	const minStopMS = Math.ceil(Math.random() * 1000);
	// const maxStopMS = minStopMS + Math.random() * 5000;
	const maxStopMS = minStopMS + Math.random() * 2000;

	return {
		speed: Math.random() * 1.2,
		baseTweenDurationSeconds: Math.ceil(Math.random() * 10),
		maxEggs: -1,
		stationaryEggLayingRate: Math.random(),
		movingEggLayingRate: 0, // Math.random(),
		hatchRate: 1, //Math.random(),
		minX,
		maxX,
		minStopMS,
		maxStopMS,
	};
}
