import { createActorContext } from '@xstate/react';
import { assign, fromPromise, log, setup } from 'xstate';
import { gameLevelMachine } from './GameLevel/gameLevel.machine';
import { nanoid } from 'nanoid';
import { getStartXPosition } from './Hen/hen.machine';
import {
	LEVEL_DURATION_MS,
	POPULATION_SIZE,
	STAGE_DIMENSIONS,
} from './GameLevel/gameConfig';
import { IndividualHen, LevelResults } from './GameLevel/types';
import { calculateFitness, mutate, rouletteWheelSelection } from './ga';

const initialGenerationPopulation = new Array(POPULATION_SIZE)
	.fill(null)
	.map(() => ({
		id: nanoid(),
		// Configuration
		initialPosition: {
			x: getStartXPosition(STAGE_DIMENSIONS.width),
			y: 10,
		},
		speed: Math.random(),
		baseTweenDurationSeconds: Math.ceil(Math.random() * 10),
		maxEggs: -1,
		stationaryEggLayingRate: Math.random(),
		movingEggLayingRate: 0, // Math.random(),
		hatchRate: Math.random(),
		// Results
		fitness: 0,
		eggsLaid: 0,
		eggsCaught: 0,
		eggsHatched: 0,
		eggsBroken: 0,
	}));

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
							x: getStartXPosition(STAGE_DIMENSIONS.width),
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
