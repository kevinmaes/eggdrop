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
  /** @xstate-layout N4IgpgJg5mDOIC5QFEpQAQBEBOB7ADugOICGAtmAMQAquaANmOmQK4AuYA2gAwC6iofLlgBLNiNwA7ASAAeiAIzcA7ADoALACYArAoCcyzeoDM65Xr0A2ADQgAnovXrV3EwA5Xxheu3c92zQBfQNtUDBwCYnIwVQAZXBIIEUkoSggpGNg2Eg5VMKw8QlIKOISklJ5+JBAhUXEpGXkEY2M3VWNNNycu1rc9BW1bBwQAy1V9dQVjXU1NUzdLYNC0AsjimPjE5KhSrZT0ADEpNlg0jNVkgDdcAGsY-Iii6N3ync3Xw+PYBCvcAGMchJJJVKjJamIgY1EJZJqoAtxLNovEYkVohohNJYFKo3EjNNxjMoEYZuNoliAHoUoiV3tsXttPpITpQwNg8NhVPh6DkAGa4bBkPIrR7UjZlOm0-ZHJnfX4A+rAvig6rghVQhCTZxmZR4zQKNzI4zojWaNTGSx6ZG4omW4zkylrZ6St7i-YAZXw2DEcDOkhivzuQvCVPW9JSYYwHq9HFlkmu8qBIL4YOEEIa1SaCm8eg0c16pIG2iLxrmOYUMOMlu4fT0PnUixCFOFIadrpde0jnu9p1Z7M53LYfIFQdWTxpbYj6Cj3Z+cf+gKkSaqglTaoziH6mhclm4WbMCmUyhag3siB8OYtClmmMPR4tDeWwcdJQAkky8JQAArcuzKld1SF1w1ZRnHMdQ3GUfQIJ8SwbFPBBzGMHF9QRA1dAGTp7WbZ8YnWdBvxIOxKAARRYMQ-xqVdANAJozGcCDpnUFRtHA-wFGNCwxm0Q8sS0Al+iLLCnzHXDonwn9VDfMR0FiMBLjAehKAo1VqLkRA3B0DQnA6DSIN3fRjQ8LVdB3LFdC6U0hNHUVVDwgi7FUeztl9f050DB0RNssT7Mcn9tlneMF0VXhlKo9MaMUUkt06XEdD1HdLXY+D-DGfQdyJSxNAsQkrJFUM7IkgA5MBZDYYgwD9bAgvQZBrnodggS-H9QoA8K1IQKw2mMBFwKxEDXFxDjD3aLpDD1LoAm0NxgkbSRcAgOAZA80UU1a6QgM6bg4WNTL2kMHpZkglQTFyltxw7Va03WiLmk6bb4OzOEdyvREplrWtTpwiNJ2lE5LrXG7CS4ktzVUED+r0DwVH6c1Ps851J2nGN-tUpo+jUBLIL1bLZiS4Y5jGcGmMh7hoe8OGbIRzAMhRtrMyY7Fs3NZFIaLdQSymnFKxMctq1mKw7UbZbQzfNg8Fp672tMbQcU6bp3D6AZjXMLc3BQyw0KzAJpqF7DPLdAALXAAHcarZfkJfVRLVHxeYfFNQ8jXgostoPDotA6I9tCxCn8u8n9LaArFUtg0k3Ag7wrxPYZLGUMZJm8eF9UhpxfeeArCMkyRpNk+T6EDm7YOccsdymiPJh0QzuC3DXvdjnVLQFtOSgzhynJSAv2qsZxOkJVpYI02Y3GVywkO0SGve6qbMUFx9rL9ihxMz4rSvKyrqtq3B6oByi1qt-pxgRPRXD1EliwelQ1H52sAkMA9-BmwIgA */
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
            gameAssets: ({ event }) =>
              (event as unknown as { output?: { gameAssets?: GameAssets } })
                .output?.gameAssets ?? null,
            loadedAudio: ({ event }) =>
              (event as unknown as { output?: { audioLoaded?: boolean } })
                .output?.audioLoaded ?? false,
            loadingStatus: ({ event }) =>
              (event as unknown as { output?: { status?: LoadingStatus } })
                .output?.status ?? { progress: 1, message: 'Ready!' },
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

export const AppActorContext: ReturnType<
  typeof createActorContext<typeof appMachine>
> = createActorContext(appMachine);
