import { createActorContext } from '@xstate/react';
import { assign, fromPromise, log, setup } from 'xstate';
import { gameLevelMachine } from './GameLevel/gameLevel.machine';
import { nanoid } from 'nanoid';
import { getGameConfig } from './GameLevel/gameConfig';
import { IndividualHen, LevelResults } from './GameLevel/types';
import {
	calculateFitness,
	crossover,
	mutate,
	mutateIndividual,
	rouletteWheelSelection,
} from './ga';
import { GameAssets } from './types/assets';
import FontFaceObserver from 'fontfaceobserver';
import {
	DNA,
	getInitialPhenotype,
	phenotypeConfig,
	PhenotypeValuesForIndividual,
} from './types/dna';

const appMachine = setup({
	types: {} as {
		input: {
			gameConfig: ReturnType<typeof getGameConfig>;
		};
		context: {
			isMuted: boolean;
			generationNumber: number;
			levelResultsHistory: LevelResults[];
			population: IndividualHen[];
			gameConfig: ReturnType<typeof getGameConfig>;
			mutationRate: number;
			mutationVariancePercentage: number;
			gameAssets: GameAssets | null;
			gameScoreData: {
				gameScore: number;
				eggsCaught: {
					white: number;
					gold: number;
					black: number;
				};
			};
		};
		events: { type: 'Toggle mute' } | { type: 'Play' } | { type: 'Quit' };
	},
	actions: {
		toggleMute: assign({
			isMuted: ({ context }) => {
				const isNowMuted = !context.isMuted;
				Howler.mute(isNowMuted);
				return isNowMuted;
			},
		}),
		gatherLastLevelResults: assign(({ context }, params: LevelResults) => {
			console.log('gatherLastLevelResults', params);
			return {
				gameScoreData: {
					gameScore:
						context.gameScoreData.gameScore + params.scoreData.levelScore,
					eggsCaught: {
						white:
							context.gameScoreData.eggsCaught.white +
							params.scoreData.eggsCaught.white,
						gold:
							context.gameScoreData.eggsCaught.gold +
							params.scoreData.eggsCaught.gold,
						black:
							context.gameScoreData.eggsCaught.black +
							params.scoreData.eggsCaught.black,
					},
				},
				levelResultsHistory: [...context.levelResultsHistory, params],
			};
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
				for (let i = 0; i < context.gameConfig.populationSize; i++) {
					// Randomly select two parents from the selected parents
					const parent1 =
						selectedParents[Math.floor(Math.random() * selectedParents.length)];
					const parent2 =
						selectedParents[Math.floor(Math.random() * selectedParents.length)];

					const childDNA = crossover(parent1.dna, parent2.dna);
					const phenotype: PhenotypeValuesForIndividual =
						getInitialPhenotype(childDNA);

					const child = {
						id: nanoid(),
						// GA
						dna: childDNA,
						phenotype,
						fitness: 0,
						// Configuration
						initialPosition: {
							x: context.gameConfig.hen.offstageLeftX,
							y: context.gameConfig.hen.y,
						},

						//
						speed: (parent1.phenotype.speed + parent2.phenotype.speed) / 2,
						baseTweenDurationSeconds:
							(parent1.phenotype.baseTweenDurationSeconds +
								parent2.phenotype.baseTweenDurationSeconds) /
							2,
						maxEggs: -1,
						stationaryEggLayingRate:
							(parent1.phenotype.stationaryEggLayingRate +
								parent2.phenotype.stationaryEggLayingRate) /
							2,
						movingEggLayingRate:
							(parent1.phenotype.movingEggLayingRate +
								parent2.phenotype.movingEggLayingRate) /
							2,
						restAfterLayingEggMS:
							(parent1.phenotype.restAfterLayingEggMS +
								parent2.phenotype.restAfterLayingEggMS) /
							2,
						blackEggRate:
							(parent1.phenotype.blackEggRate +
								parent2.phenotype.blackEggRate) /
							2,
						goldEggRate:
							(parent1.phenotype.goldEggRate + parent2.phenotype.goldEggRate) /
							2,
						hatchRate:
							(parent1.phenotype.hatchRate + parent2.phenotype.hatchRate) / 2,
						minXMovement: Math.round(
							(parent1.phenotype.minXMovement +
								parent2.phenotype.minXMovement) /
								2
						),
						maxXMovement: Math.round(
							(parent1.phenotype.maxXMovement +
								parent2.phenotype.maxXMovement) /
								2
						),
						minStopMS:
							(parent1.phenotype.minStopMS + parent2.phenotype.minStopMS) / 2,
						maxStopMS:
							(parent1.phenotype.maxStopMS + parent2.phenotype.maxStopMS) / 2,

						eggsLaid: 0,
						eggsCaught: {
							white: 0,
							gold: 0,
							black: 0,
						},
						eggsHatched: 0,
						eggsBroken: 0,
						eggStats: {},
					};
					nextGeneration.push(child);
				}

				// Mutate
				const mutatedNextGenerationPopulation = nextGeneration.map(
					(individual) => {
						return mutateIndividual(
							individual,
							phenotypeConfig,
							context.mutationRate,
							context.mutationVariancePercentage
						);
					}
				);

				return mutatedNextGenerationPopulation;
			},
		}),
	},
	actors: {
		loadSprites: fromPromise<GameAssets>(async () => {
			const henResult = await fetch('images/hen.sprite.json');
			const henSpriteData = await henResult.json();
			const eggResult = await fetch('images/egg.sprite.json');
			const eggSpriteData = await eggResult.json();
			const chickResult = await fetch('images/chick.sprite.json');
			const chickSpriteData = await chickResult.json();
			const chefResult = await fetch('images/chef.sprite.json');
			const chefSpriteData = await chefResult.json();
			const controlsResult = await fetch('images/controls.sprite.json');
			const controlsSpriteData = await controlsResult.json();

			return {
				controls: controlsSpriteData,
				hen: henSpriteData,
				egg: eggSpriteData,
				chick: chickSpriteData,
				chef: chefSpriteData,
			};
		}),
		loadFonts: fromPromise(() => {
			const arcoFont = new FontFaceObserver('Arco');
			const jetBrainsMonoFont = new FontFaceObserver('JetBrains Mono');
			return Promise.all([arcoFont.load(), jetBrainsMonoFont.load()]);
		}),
		gameLevelMachine,
	},
}).createMachine({
	id: 'Egg Drop Game',
	context: ({ input }) => ({
		gameConfig: input.gameConfig,
		generationNumber: 1,
		levelResultsHistory: [],
		population: new Array(input.gameConfig.populationSize)
			.fill(null)
			.map(() => {
				const dnaLength = Object.keys(phenotypeConfig).length;
				const initialDNA = new DNA(dnaLength);

				const phenotype = getInitialPhenotype(initialDNA);
				// Pick minimum and maximum X positions for the hen.
				return {
					id: nanoid(),
					// GA
					dna: initialDNA,
					phenotype,
					fitness: 0,
					// Configuration
					initialPosition: {
						x: input.gameConfig.hen.offstageLeftX,
						y: input.gameConfig.hen.y,
					},
					// Results
					eggsLaid: 0,
					eggsCaught: {
						white: 0,
						gold: 0,
						black: 0,
					},
					eggsHatched: 0,
					eggsBroken: 0,
					eggStats: {},
				};
			}),
		populationSize: input.gameConfig.populationSize,
		gameAssets: null,
		mutationRate: 0.1,
		mutationVariancePercentage: 8,
		gameScoreData: {
			gameScore: 0,
			eggsCaught: {
				white: 0,
				gold: 0,
				black: 0,
			},
		},
		isMuted: input.gameConfig.isMuted,
	}),
	on: {
		'Toggle mute': {
			actions: { type: 'toggleMute' },
		},
	},
	initial: 'Loading',
	states: {
		Loading: {
			initial: 'Loading Fonts',
			states: {
				'Loading Fonts': {
					invoke: {
						onDone: 'Loading Sprites',
						onError: '#Egg Drop Game.Show Error',
						src: 'loadFonts',
					},
				},
				'Loading Sprites': {
					invoke: {
						onDone: {
							target: 'Done',
							actions: assign({
								gameAssets: ({ event }) => event.output,
							}),
						},
						onError: '#Egg Drop Game.Show Error',
						src: 'loadSprites',
					},
				},
				Done: {
					type: 'final',
				},
			},
			onDone: 'Intro',
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
					tags: ['actively playing'],
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
								generationNumber: context.generationNumber,
								levelDuration: context.gameConfig.levelDurationMS,
								population: context.population,
							};
						},
						onDone: {
							target: 'Next Generation Evolution',
							actions: {
								type: 'gatherLastLevelResults',
								params: ({ event }) => event.output,
							},
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
						'evaluateAndEvolveNextGeneration',
						assign({
							generationNumber: ({ context }) => context.generationNumber + 1,
						}),
					],
				},
			},
		},
	},
});

export const AppActorContext = createActorContext(appMachine);
