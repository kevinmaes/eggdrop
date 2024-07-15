import { createActorContext } from '@xstate/react';
import { assign, fromPromise, log, setup } from 'xstate';
import { gameLevelMachine } from './GameLevel/gameLevel.machine';
import { nanoid } from 'nanoid';
import {
	HEN_Y_POSITION,
	LEVEL_DURATION_MS,
	POPULATION_SIZE,
	STAGE_DIMENSIONS,
} from './GameLevel/gameConfig';
import { IndividualHen, LevelResults } from './GameLevel/types';
import { calculateFitness, mutate, rouletteWheelSelection } from './ga';

export function getOffScreenStartXPosition(
	stageWidth: number,
	buffer: number = 50
) {
	return Math.random() > 0.5 ? -buffer : stageWidth + buffer;
}

const initialGenerationPopulation = new Array(POPULATION_SIZE)
	.fill(null)
	.map(() => {
		// Pick minimum and maximum X positions for the hen.
		return {
			id: nanoid(),
			// Configuration
			initialPosition: {
				x: getOffScreenStartXPosition(STAGE_DIMENSIONS.width),
				y: HEN_Y_POSITION,
			},
			speed: Math.random() * 1.2,
			baseTweenDurationSeconds: Math.ceil(Math.random() * 10),
			maxEggs: -1,
			stationaryEggLayingRate: Math.random(),
			movingEggLayingRate: 0, // Math.random(),
			hatchRate: Math.random(),
			minX: (Math.random() * 0.25 + 0.25) * STAGE_DIMENSIONS.width,
			maxX: (1 - 0.25 - Math.random() * 0.25) * STAGE_DIMENSIONS.width,
			// Results
			fitness: 0,
			eggsLaid: 0,
			eggsCaught: 0,
			eggsHatched: 0,
			eggsBroken: 0,
		};
	});

const appMachine = setup({
	types: {} as {
		context: {
			generationIndex: number;
			levelResultsHistory: LevelResults[];
			population: IndividualHen[];
			populationSize: number;
			mutationRate: number;
			mutationVariancePercentage: number;
		};
		events:
			| { type: 'Start' }
			| { type: 'Start next level' }
			| { type: 'Quit' }
			| {
					type: 'Level complete';
					levelResults: LevelResults;
			  };
	},
	actions: {
		pushLastLevelResultsToHistory: assign({
			levelResultsHistory: (
				{ context },
				params: { levelResults: LevelResults }
			) => [...context.levelResultsHistory, params.levelResults],
		}),
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
				for (let i = 0; i < context.populationSize; i++) {
					// Randomly select two parents from the selected parents
					const parent1 =
						selectedParents[Math.floor(Math.random() * selectedParents.length)];
					const parent2 =
						selectedParents[Math.floor(Math.random() * selectedParents.length)];

					const child = {
						id: nanoid(),
						initialPosition: {
							x: getOffScreenStartXPosition(STAGE_DIMENSIONS.width),
							y: 10,
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
						hatchRate: (parent1.hatchRate + parent2.hatchRate) / 2,
						minX: (parent1.minX + parent2.minX) / 2,
						maxX: (parent1.maxX + parent2.maxX) / 2,
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
						],
						context.mutationRate,
						context.mutationVariancePercentage
					);
				});

				console.log('Mutated population:', mutatedNextGenerationPopulation);
				return mutatedNextGenerationPopulation;
			},
		}),
	},
	actors: {
		loadAssets: fromPromise(() => {
			return Promise.resolve();
		}),
		gameLevelMachine,
	},
}).createMachine({
	context: {
		generationIndex: 0,
		levelResultsHistory: [],
		population: initialGenerationPopulation,
		populationSize: 10,
		lastLevelResults: null,
		mutationRate: 0.1,
		mutationVariancePercentage: 8,
	},
	id: 'Egg Drop Game',
	initial: 'Loading',
	states: {
		Loading: {
			invoke: {
				input: {},
				onDone: {
					target: 'Intro',
				},
				onError: {
					target: 'Show Error',
				},
				src: 'loadAssets',
			},
		},
		Intro: {
			on: {
				Start: {
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
					after: {
						2000: 'Playing',
					},
				},
				Playing: {
					on: {
						'Level complete': {
							actions: {
								type: 'pushLastLevelResultsToHistory',
								params: ({ event }) => ({
									levelResults: event.levelResults,
								}),
							},
							target: 'Next Generation Evolution',
						},
					},
					invoke: {
						src: 'gameLevelMachine',
						systemId: 'gameLevelMachine',
						input: ({ context }) => ({
							generationIndex: context.generationIndex,
							levelDuration: LEVEL_DURATION_MS,
							population: context.population,
						}),
					},
					description: 'The main state for game play of each level',
				},
				'Next Generation Evolution': {
					tags: ['level summary'],
					on: {
						'Start next level': 'Playing',
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
