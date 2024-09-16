import type { LevelResults } from '../GameLevel/types';

export function calculateFitness(
	latestLevelResults: LevelResults,
	henId: string
) {
	const hendividual = latestLevelResults.henStatsById[henId];
	if (!hendividual) {
		throw new Error('Hen results are missing!');
	}
	const henStats = hendividual.stats;

	let overallFitness = 0;
	const fitnessWeights = {
		eggsLaid: 0.4,
		eggsUncaught: 0.5,
		blackEggsCaught: 0.1,
	};

	// Punish hens that lay no eggs
	if (henStats.eggsLaid === 0) {
		return overallFitness;
	}

	// Reward hens that lay more eggs
	const eggsLaidRate =
		henStats.eggsLaid / latestLevelResults.levelStats.totalEggsLaid;
	const eggsLaidFitness =
		1 - eggsLaidRate * eggsLaidRate * fitnessWeights.eggsLaid;

	const eggsCaughtTotal =
		henStats.eggsCaught.white +
		henStats.eggsCaught.gold +
		henStats.eggsCaught.black;

	const eggsUncaughtRate = eggsCaughtTotal / henStats.eggsLaid;
	const eggsUncaughtFitness =
		1 - eggsUncaughtRate * eggsUncaughtRate * fitnessWeights.eggsUncaught;

	const blackEggsCaughtRate = henStats.eggsCaught.black / henStats.eggsLaid;
	const blackEggsCaughtFitness =
		blackEggsCaughtRate * blackEggsCaughtRate * fitnessWeights.blackEggsCaught;

	overallFitness =
		eggsLaidFitness + eggsUncaughtFitness + blackEggsCaughtFitness;
	return overallFitness;
}
