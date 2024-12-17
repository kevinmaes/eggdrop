import { createActorContext } from '@xstate/react';
import { assign, fromPromise, setup } from 'xstate';
import { gameLevelMachine } from './GameLevel/gameLevel.machine';
import { nanoid } from 'nanoid';
import { getGameConfig } from './GameLevel/gameConfig';
import type { Hendividual, LevelResults } from './GameLevel/types';
import { eliteSelection, mutateIndividual } from './geneticAlgorithm/ga';
import { calculateFitness } from './geneticAlgorithm/eggdropGA';
import type { GameAssets } from './types/assets';
import FontFaceObserver from 'fontfaceobserver';
import { DNA } from './geneticAlgorithm/DNA';
import {
	createPhenotypeForIndividual,
	phenotypeConfig,
	type PhenotypeValuesForIndividual,
} from './geneticAlgorithm/phenotype';

const appMachine = setup({
	types: {} as {
		input: {
			gameConfig: ReturnType<typeof getGameConfig>;
		};
		context: {
			isMuted: boolean;
			generationNumber: number;
			levelResultsHistory: LevelResults[];
			population: Hendividual[];
			gameConfig: ReturnType<typeof getGameConfig>;
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
		setLoadedGameAssets: assign({
			gameAssets: (_, params: GameAssets) => params,
		}),
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
		evaluatePopulationFitness: assign(({ context }) => {
			const newLevelResultsHistory = context.levelResultsHistory.slice();

			// Evaluate fitness
			const latestLevelResults = newLevelResultsHistory.slice(
				-1
			)[0] as LevelResults;

			// Calculate the fitness of each individual in the population
			// while also calculating the average fitness of the population.
			let aggregateFitness = 0;
			const evaluatedPopulation = context.population.map((individual) => {
				individual.fitness = calculateFitness(
					latestLevelResults,
					individual.id
				);
				console.log('hendividualFitness', individual.fitness);
				aggregateFitness += individual.fitness;
				return individual;
			});
			const averageFitness = aggregateFitness / evaluatedPopulation.length;
			latestLevelResults.levelStats.averageFitness = averageFitness;

			return {
				population: evaluatedPopulation,
				levelResultsHistory: newLevelResultsHistory,
			};
		}),
		selectCrossoverAndMutatePopulation: assign({
			population: ({ context }) => {
				// GA Selection
				// Select one third of the population to be parents for the next generation
				// with a combination of 5% elitism and roulette wheel selection
				const selectedParents = eliteSelection(
					context.population,
					Math.round(context.population.length / 3),
					Math.floor(context.population.length * 0.05)
				);

				// GA Crossover
				const nextGeneration: Hendividual[] = [];

				// Iterate through the entire population to create the next generation
				for (let i = 0; i < context.gameConfig.populationSize; i++) {
					// Randomly select two parents from the selected parents
					const parent1 = selectedParents[
						Math.floor(Math.random() * selectedParents.length)
					] as Hendividual;
					const parent2 = selectedParents[
						Math.floor(Math.random() * selectedParents.length)
					] as Hendividual;

					const childDNA = DNA.crossover(parent1.dna, parent2.dna);
					const childPhenotype: PhenotypeValuesForIndividual =
						createPhenotypeForIndividual(childDNA.getGenes(), phenotypeConfig);

					const child = {
						id: nanoid(),
						// GA
						dna: childDNA,
						phenotype: childPhenotype,
						fitness: 0,
						// Configuration
						initialPosition: {
							x: context.gameConfig.hen.offstageLeftX,
							y: context.gameConfig.hen.y,
						},
						// Results
						stats: {
							eggsLaid: 0,
							eggsCaught: {
								white: 0,
								gold: 0,
								black: 0,
							},
							eggsHatched: 0,
							eggsBroken: 0,
							eggsOffscreen: 0,
							eggStats: {},
						},
					};
					nextGeneration.push(child);
				}

				// GA Mutation
				const mutatedNextGenerationPopulation = nextGeneration.map(
					(individual) => {
						return mutateIndividual(
							individual,
							phenotypeConfig,
							context.gameConfig.ga.mutationRate,
							context.gameConfig.ga.mutationVariancePercentageRate
						);
					}
				);

				return mutatedNextGenerationPopulation;
			},
		}),
		incrementGenerationNumber: assign({
			generationNumber: ({ context }) => context.generationNumber + 1,
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
			const uiResult = await fetch('images/ui.sprite.json');
			const uiSpriteData = await uiResult.json();

			return {
				ui: uiSpriteData,
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
	/** @xstate-layout N4IgpgJg5mDOIC5QFEpQAQBEBOB7ADugOICGAtmAHQAyuJEAlgHZQ12MvoBiuTALrADEEXlWYA3XAGsqqDDgLFyVWvWatVHDD36wEE3AGMSfBrwDaABgC6V64lD5csBqd4OQAD0QA2AMw+lADsABwAnH5BYQBMYUFBPpYArAA0IACeiLFJlNEALEF5lmEhlpZRAIx5AL7VaXJYeISkFGxqLG1a3LwCgmDYeNiU+AA2JgBmuNhklA0Kzcqd6kucOgL6TJLGbkx2dh5OLjse3gh5SZaUFUkXPkklFdEVCWmZCEnRgRVheRV+SY9on48iEfLV6mhGooWip2MtNOp0ABlfDYVxwYSiSgGGSzSHzJStBEdYkYFFovhwDZbExmXY2fZIECHVx0k6ICrPQI+cKfaKFe6c1IZLJJILBApFEplSo1OogOZNQmw9oaOGccnooT9QbDMZ8SbTPHyJUwlZq1XI1Fa6lGWkWBk2A7OVnuJmnMKWCqUe7RUqWAr+T0+V6IEHepI+O5FCplX5+MLghX402LUmYphUWB8EyyFPQtPqqCMxwu47uxB+PwhSh+P15EF5avha6h96fK4-P4A6JAkFg+WKgutACS-DwggACmN0iXmWW2RWzoVgj8QkFvuvzlG21E-JQQhVSjz-kK-UmhwtWjD0NOSOlKGPXOhqGBxGARoISCMAO732Bziy5agKcITnMEPJetWfiWD4sRBG2ITAlcISRj48T3Am-gXvmV5UDed4PoR6gZmImzSHmJrDvhyi3jOlDESwtrbHSexOkyQGLiBHJlDkZQBD4ESWAmVZ5G2sblFc3bbjBfJyhCVF4ZQBH0QAcmAnh8MQYCZtg9pMOgyCSCMACuOxTjOgELm63EIKhOTxL83x1vyh4hiKCCxrElA+NJkayXBfg4YpyrKbRhGCAAiiZrhWUcXFeGGwnBH8sENl6nwVOJGXBCE0SWKh-w-MkA4KVCeGCAAKrgaAjGA6BkGZYBxa6TDsp50Rth8tTykwuAQHAHiXsqzrxTZiUIH6lzCm8kYSoUxT+pUATBeVoWkqNrXtXWNYzRyeSBIUC3SuUYR-KVyYhWapLmt0uibcBE2RIEe2TQE81SktZ0rYOuHrUWt2apS8AcdZbVLsGPoxP6gYJskbZAodkqLTKZ3yZda3XQDmCiA9CWnFUIIHvyQKhDcSSoQjZ25MjJ2yqtBJmmOfB4Hj42nMCOR5WBjbNmdr1RNEB5HrBSEAtc56-VdixIgAFrgP6GQMUxs+DtlhAClDFFNAYJHDYkeZGQvCcGaOcn4FQM6m17hTOqvtb5XxRskITrlUjyvT4RNHmhGERGE2FS5jiwqfej5MM+r7viM9tLlGeRXM7FNu780SvaUQs8r7QSYQHQVB4zIe22HjFQLH6vhFrwlRkJInAru1YodnueB2Vhc2xQdFh+pmnabp+mGcZZkJZx7OIKECewRuiTxuhfriVUYS1mTljZF2B09dUQA */
	id: 'Egg Drop Game',
	context: ({ input }) => {
		const initialPopulation = new Array(input.gameConfig.populationSize)
			.fill(null)
			.map(() => {
				const dnaLength = Object.keys(phenotypeConfig).length;
				const initialDNA = new DNA(dnaLength);
				const phenotype = createPhenotypeForIndividual(
					initialDNA.getGenes(),
					phenotypeConfig
				);

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
					stats: {
						eggsLaid: 0,
						eggsCaught: {
							white: 0,
							gold: 0,
							black: 0,
						},
						eggsHatched: 0,
						eggsBroken: 0,
						eggsOffscreen: 0,
						eggStats: {},
					},
				};
			});

		return {
			gameConfig: input.gameConfig,
			generationNumber: 1,
			levelResultsHistory: [],
			population: initialPopulation,
			gameAssets: null,
			gameScoreData: {
				gameScore: 0,
				eggsCaught: {
					white: 0,
					gold: 0,
					black: 0,
				},
			},
			isMuted: input.gameConfig.isMuted,
		};
	},
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
							actions: {
								type: 'setLoadedGameAssets',
								params: ({ event }) => event.output,
							},
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
					// Be sure to eagerly evaluate the fitness of the population
					// so that stats are available between levels.
					entry: 'evaluatePopulationFitness',
					on: {
						Play: 'Playing',
					},
					exit: [
						// Continue with the rest of the GA steps before starting the next level.
						'selectCrossoverAndMutatePopulation',
						'incrementGenerationNumber',
					],
				},
			},
		},
	},
});

export const AppActorContext: ReturnType<
	typeof createActorContext<typeof appMachine>
> = createActorContext(appMachine);
