import { createActorContext } from '@xstate/react';
import { assign, fromPromise, log, setup } from 'xstate';
import { gameLevelMachine } from './GameLevel/gameLevel.machine';
import { nanoid } from 'nanoid';
import {
	getGameConfig,
	getInitialChromosomeValues,
} from './GameLevel/gameConfig';
import { IndividualHen, LevelResults } from './GameLevel/types';
import { calculateFitness, mutate, rouletteWheelSelection } from './ga';
import { GameAssets } from './types/assets';

// export function getOffScreenStartXPosition(
// 	stageWidth: number,
// 	buffer: number = 200
// ) {
// 	return Math.random() > 0.5 ? -buffer : stageWidth + buffer;
// }

const appMachine = setup({
	types: {} as {
		input: {
			gameConfig: ReturnType<typeof getGameConfig>;
		};
		context: {
			isMuted: boolean;
			generationIndex: number;
			levelResultsHistory: LevelResults[];
			population: IndividualHen[];
			gameConfig: ReturnType<typeof getGameConfig>;
			mutationRate: number;
			mutationVariancePercentage: number;
			gameAssets: GameAssets | null;
			gameScore: number;
		};
		events:
			| { type: 'Toggle mute' }
			| { type: 'Play' }
			| { type: 'Quit' }
			| {
					type: 'Level complete';
					levelResults: LevelResults;
			  };
	},
	actions: {
		toggleMute: assign({
			isMuted: ({ context }) => {
				const isNowMuted = !context.isMuted;
				Howler.mute(isNowMuted);
				return isNowMuted;
			},
		}),
		gatherLastLevelResults: assign(
			({ context }, params: { levelResults: LevelResults }) => {
				return {
					gameScore: context.gameScore + params.levelResults.score,
					levelResultsHistory: [
						...context.levelResultsHistory,
						params.levelResults,
					],
				};
			}
		),
		evaluateAndEvolveNextGeneration: assign({
			population: ({ context }) => {
				// Evaluate fitness
				const lastLevelResults = context.levelResultsHistory.slice(-1)[0];
				const evaluatedPopulation = context.population.map((individual) => {
					const individualResult = lastLevelResults.henStatsById[individual.id];
					if (!individualResult) {
						return individual;
					}
					individual.fitness = calculateFitness(individualResult);
					return individual;
				});

				// Select by fitness (roulette wheel selection)
				const selectedParents = [];
				// Only select a total of 33% of the population to be parents
				// based on roulette wheel selection.
				for (let i = 0; i < evaluatedPopulation.length / 3; i++) {
					selectedParents.push(rouletteWheelSelection(evaluatedPopulation));
				}

				// Crossover
				const nextGeneration: IndividualHen[] = [];

				// Iterate through the entire population to create the next generation
				for (let i = 0; i < context.gameConfig.populationSize; i++) {
					// Randomly select two parents from the selected parents
					const parent1 =
						selectedParents[Math.floor(Math.random() * selectedParents.length)];
					const parent2 =
						selectedParents[Math.floor(Math.random() * selectedParents.length)];

					// Crossover the parents' min and max X positions
					// but ensure that minX is less than maxX
					let minX = Math.round((parent1.minX + parent2.minX) / 2);
					let maxX = Math.round((parent1.maxX + parent2.maxX) / 2);

					if (minX > maxX) {
						[minX, maxX] = [maxX, minX];
					}

					const child = {
						id: nanoid(),
						initialPosition: {
							x: context.gameConfig.hen.offstageLeftX,
							y: context.gameConfig.hen.y,
						},
						speed: (parent1.speed + parent2.speed) / 2,
						baseTweenDurationSeconds:
							(parent1.baseTweenDurationSeconds +
								parent2.baseTweenDurationSeconds) /
							2,
						maxEggs: -1,
						stationaryEggLayingRate:
							(parent1.stationaryEggLayingRate +
								parent2.stationaryEggLayingRate) /
							2,
						movingEggLayingRate:
							(parent1.movingEggLayingRate + parent2.movingEggLayingRate) / 2,
						restAfterLayingEggMS:
							(parent1.restAfterLayingEggMS + parent2.restAfterLayingEggMS) / 2,
						blackEggRate: (parent1.blackEggRate + parent2.blackEggRate) / 2,
						goldEggRate: (parent1.goldEggRate + parent2.goldEggRate) / 2,
						hatchRate: (parent1.hatchRate + parent2.hatchRate) / 2,
						minX,
						maxX,
						minStopMS: (parent1.minStopMS + parent2.minStopMS) / 2,
						maxStopMS: (parent1.maxStopMS + parent2.maxStopMS) / 2,
						fitness: 0,
						eggsLaid: 0,
						eggsCaught: 0,
						eggsHatched: 0,
						eggsBroken: 0,
					};
					nextGeneration.push(child);
				}

				// Mutate
				const mutatedNextGenerationPopulation = nextGeneration.map((member) => {
					return mutate(
						member,
						[
							'speed',
							'baseTweenDurationSeconds',
							'stationaryEggLayingRate',
							'movingEggLayingRate',
							'hatchRate',
							'minX',
							'maxX',
							'minStopMS',
							'maxStopMS',
						],
						context.mutationRate,
						context.mutationVariancePercentage
					);
				});

				return mutatedNextGenerationPopulation;
			},
		}),
	},
	actors: {
		loadAssets: fromPromise<GameAssets>(async () => {
			const henResult = await fetch('images/hen.sprite.json');
			const henSpriteData = await henResult.json();
			const eggResult = await fetch('images/egg.sprite.json');
			const eggSpriteData = await eggResult.json();
			const chickResult = await fetch('images/chick.sprite.json');
			const chickSpriteData = await chickResult.json();
			const chefResult = await fetch('images/chef.sprite.json');
			const chefSpriteData = await chefResult.json();

			return {
				hen: {
					sprite: henSpriteData,
				},
				egg: {
					sprite: eggSpriteData,
				},
				chick: {
					sprite: chickSpriteData,
				},
				chef: {
					sprite: chefSpriteData,
				},
			};
		}),
		gameLevelMachine,
	},
}).createMachine({
	context: ({ input }) => ({
		gameConfig: input.gameConfig,
		generationIndex: 0,
		levelResultsHistory: [],
		population: new Array(input.gameConfig.populationSize)
			.fill(null)
			.map(() => {
				// Pick minimum and maximum X positions for the hen.
				return {
					id: nanoid(),
					// Configuration
					initialPosition: {
						x: input.gameConfig.hen.offstageLeftX,
						y: input.gameConfig.hen.y,
					},
					...getInitialChromosomeValues(),
					// Results
					fitness: 0,
					eggsLaid: 0,
					eggsCaught: 0,
					eggsHatched: 0,
					eggsBroken: 0,
				};
			}),
		populationSize: input.gameConfig.populationSize,
		gameAssets: null,
		mutationRate: 0.1,
		mutationVariancePercentage: 8,
		gameScore: 0,
		isMuted: input.gameConfig.isMuted,
	}),
	id: 'Egg Drop Game',
	on: {
		'Toggle mute': {
			actions: { type: 'toggleMute' },
		},
	},
	initial: 'Loading',
	states: {
		Loading: {
			invoke: {
				input: {},
				onDone: {
					target: 'Intro',
					actions: assign({
						gameAssets: ({ event }) => event.output,
					}),
				},
				onError: {
					target: 'Show Error',
				},
				src: 'loadAssets',
			},
		},
		Intro: {
			on: {
				Play: {
					target: 'Game Play',
				},
			},
		},
		'Show Error': {},
		'Game Play': {
			initial: 'Init Level',
			on: {
				Quit: {
					target: 'Intro',
				},
			},

			states: {
				'Init Level': {
					tags: ['init level'],
					always: 'Playing',
				},
				Playing: {
					on: {
						'Level complete': {
							actions: [
								{
									type: 'gatherLastLevelResults',
									params: ({ event }) => ({
										levelResults: event.levelResults,
									}),
								},
							],
							target: 'Next Generation Evolution',
						},
					},
					invoke: {
						src: 'gameLevelMachine',
						systemId: 'gameLevelMachine',
						input: ({ context }) => {
							if (!context.gameAssets) {
								throw new Error('Game assets not loaded');
							}
							return {
								gameConfig: context.gameConfig,
								gameAssets: context.gameAssets,
								generationIndex: context.generationIndex,
								levelDuration: context.gameConfig.levelDurationMS,
								population: context.population,
							};
						},
					},
					description: 'The main state for game play of each level',
				},
				'Next Generation Evolution': {
					tags: ['between levels'],
					on: {
						Play: 'Playing',
					},
					entry: [log('Show summary')],
					exit: [
						log('Leave summary and prep next gen'),
						'evaluateAndEvolveNextGeneration',
						assign({
							generationIndex: ({ context }) => context.generationIndex + 1,
						}),
					],
				},
			},
		},
	},
});

export const AppActorContext = createActorContext(appMachine);
