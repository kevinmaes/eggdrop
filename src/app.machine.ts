import { Howler } from 'howler';

import { createActorContext } from '@xstate/react';
import { nanoid } from 'nanoid';
import { assign, setup, type ActorRefFrom } from 'xstate';

import { APP_ACTOR_ID, GAME_LEVEL_ACTOR_ID, LOADING_MSG } from './constants';
import { type GameConfig } from './gameConfig';
import {
  gameLevelMachine,
  type GameLevelActorRef,
} from './GameLevel/gameLevel.machine';
import { DNA } from './geneticAlgorithm/DNA';
import { calculateFitness } from './geneticAlgorithm/eggdropGA';
import { eliteSelection, mutateIndividual } from './geneticAlgorithm/ga';
import {
  createPhenotypeForIndividual,
  phenotypeConfig,
  type PhenotypeValuesForIndividual,
} from './geneticAlgorithm/phenotype';
import { loadingMachine, type LoadingStatus } from './Loading/loading.machine';
import { setAppActorRef } from './test-api';

import type { ChefActorRef } from './Chef/chef.machine';
import type { EggActorRef } from './Egg/egg.machine';
import type { Hendividual, LevelResults } from './GameLevel/types';
import type { GameAssets } from './types/assets';

export type AppActorRef = ActorRefFrom<typeof appMachine>;

export const appMachine = setup({
  types: {} as {
    input: {
      gameConfig: GameConfig;
    };
    context: {
      isMuted: boolean;
      generationNumber: number;
      levelResultsHistory: LevelResults[];
      population: Hendividual[];
      gameConfig: GameConfig;
      gameAssets: GameAssets | null;
      loadedAudio: boolean;
      loadingStatus: LoadingStatus;
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
    setActorRefForTests: ({ context, self }) => {
      // Set the app ref on the test API only on creation
      if (context.gameConfig.isTestMode) {
        setAppActorRef(self as AppActorRef);
      }
    },
    setLoadingStatus: assign({
      loadingStatus: (_, params: LoadingStatus) => params,
    }),
    syncLoadingStatus: assign({
      loadingStatus: ({ event, context }) => {
        const next =
          (
            event as {
              snapshot?: { context?: { status?: LoadingStatus } };
            }
          ).snapshot?.context?.status ?? context.loadingStatus;
        return next;
      },
    }),
    toggleMute: assign({
      isMuted: ({ context }) => {
        const isNowMuted = !context.isMuted;
        Howler.mute(isNowMuted);
        return isNowMuted;
      },
    }),
    gatherLastLevelResults: assign(({ context }, params: LevelResults) => {
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
    loadingMachine,
    gameLevelMachine,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAYgBUB7KKAGzAAJUBXAFzAG0AGAXUVAAcKsXC1wV8fEAA9EANgAcAOgCMAdgCcAJgDMs9cs4BWees7aANCACeiALSnFq1YYAs8+YeWyXmt6oC+-pZoWHiERIoAMhToEARQJBDiYIoEAG4UANYp0bHxjKEEHDySgsKi4pIyCK6GKsrymoaaqjp66qqWNgjKmoqyrQ0unMou2tqcnKrKgcEYOEURuXH4CWAATusU64r8NOgsAGbbqFExK1AFC4RcvEggZSJiEvfV8mOKnN6GpnrD3rIunZ9J9fLJOPIAeD5NpZiAQtdiIoAJL4FhbEgABX2VlupSET0qrzkmmUiha6nkI20hj0qm08iBPXU6n6Ok4pKcughmjhCLCSIA4uhUAxsegrCQAIpMER4+6PCovUDVQyqFyfEYtVTed4-TRM7QdRw+dS1bReZouPnzAURYWi+jiqwo-AieiRMBpMA0EjygQEpVVRCGYz9UbjVQmL4uFxMn6qRSuKaxsYmeReG2FcKKB1inGKZ3xRLJVL4DLZRT8xa5kX5iWFnHxBDpCiYA7PW7+h6B57Bmph2QR7RR36xpmpxSQhkj9RjTTqbQuQxZxH2utOgsAOTAUhY9EFYEI6w74noAFEMjRWM8sTju4q+8SB0oh2MR9HvHHrCGRyoRy0oyjJogGBEEID4BQEBwJI1bhPi5RPiqiDKL0-QuHoIFmmMWoWD+CC2JosjaIoPg6Ga7j6OoAyrnaZx5KsCGEsq0iIC4Orkux7zscYfx4d0ti9KyLSTN8Wh+FMtE1qi6IUExQbPuCdSeJC4LKKYIF6EyvR9GakwspwLLquq6hSTmADK2AUAA7hemzbPJSGsQg3GKEa7wjrGzgaIy+GESRmjvJSQ46gopIKGZQobs6jlEshPTguhmELq4Ey9PxiA0mSaoMrInjpc0MzgXBUWOs6rrup63o0LFLHVGMGqDKh-xfLIRGdPhPyyOSEKcOxaYMu4kXrmVBZFoxCq9nFzlRt1fVaE0S5LTS8aTOhaj0uM6lzmaw21qNDY7nuB5Hhsp74BeV43tNj7TdUmgQklC3YWlOgTgyU7UVSjSUnOQ5gf4QA */
  id: APP_ACTOR_ID,
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
      loadedAudio: false,
      loadingStatus: {
        progress: 0,
        message: LOADING_MSG,
      },
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
  entry: 'setActorRefForTests',
  states: {
    Loading: {
      entry: assign({
        loadingStatus: () => ({
          progress: 0,
          message: 'Initializing...',
        }),
      }),
      invoke: {
        src: 'loadingMachine',
        id: 'Loading machine',
        input: () => ({}),
        onSnapshot: [
          {
            actions: 'syncLoadingStatus',
          },
        ],
        onDone: {
          target: 'Intro',
          actions: assign({
            gameAssets: ({ event }) => event.output?.gameAssets ?? null,
            loadedAudio: ({ event }) => event.output?.audioLoaded ?? false,
            loadingStatus: ({ event }) =>
              event.output?.status ?? { progress: 1, message: 'Ready!' },
          }),
        },
        onError: 'Show Error',
      },
    },
    Intro: {
      on: {
        Play: {
          target: 'Game Play',
        },
      },
    },
    'Show Error': {
      entry: {
        type: 'setLoadingStatus',
        params: {
          progress: 1,
          message: 'Failed to load assets.',
        },
      },
      type: 'final',
    },
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
            systemId: GAME_LEVEL_ACTOR_ID,
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

export type EggDropGameActorRef =
  | AppActorRef
  | ChefActorRef
  | GameLevelActorRef
  | EggActorRef;

export const AppActorContext = createActorContext(appMachine);
