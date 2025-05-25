import { Rect } from 'konva/lib/shapes/Rect';
import { nanoid } from 'nanoid';
import {
  type ActorRefFrom,
  assertEvent,
  assign,
  emit,
  log,
  sendTo,
  setup,
} from 'xstate';

import { chefMachine } from '../Chef/chef.machine';
import { CHEF_ACTOR_ID, GAME_LEVEL_ACTOR_ID } from '../constants';
import {
  type EggColor,
  type EggDoneEvent,
  type EggResultStatus,
  eggMachine,
} from '../Egg/egg.machine';
import {
  eggCaughtPointsMachine,
  type EggCaughtPointsDoneEvent,
} from '../EggCaughtPoints/eggCaughtPoints.machine';
import { type HenDoneEvent, henMachine } from '../Hen/hen.machine';
import { sounds } from '../sounds';
import { addEggToHistory } from '../test-api';
import { isImageRef, type Direction, type Position } from '../types';

import {
  countdownTimer,
  type CountdownTimerTickEvent,
} from './countdownTimer.actor';
import { getGameConfig } from './gameConfig';

import type { GenerationStats, Hendividual, LevelResults } from './types';
import type { GameAssets } from '../types/assets';

export type GameLevelActorRef = ActorRefFrom<typeof gameLevelMachine>;

export const gameLevelMachine = setup({
  types: {} as {
    input: {
      gameConfig: ReturnType<typeof getGameConfig>;
      gameAssets: GameAssets;
      generationNumber: number;
      levelDuration: number;
      population: Hendividual[];
    };
    output: LevelResults;
    emitted: {
      type: 'Egg caught';
      eggColor: EggColor;
    };
    context: {
      gameConfig: ReturnType<typeof getGameConfig>;
      gameAssets: GameAssets;
      remainingMS: number;
      generationNumber: number;
      henActorRefs: ActorRefFrom<typeof henMachine>[];
      eggActorRefs: ActorRefFrom<typeof eggMachine>[];
      eggCaughtPointsActorRefs: ActorRefFrom<typeof eggCaughtPointsMachine>[];
      chefPotRimHitRef: React.RefObject<Rect> | null;
      nextHenIndex: number;
      hensLeft: number;
      levelStats: GenerationStats;
      henStatsById: Record<string, Hendividual>;
      population: Hendividual[];
      scoreData: {
        levelScore: number;
        eggsCaught: {
          white: number;
          gold: number;
          black: number;
        };
      };
    };
    events:
      | { type: 'Pause game' }
      | { type: 'Resume game' }
      | {
          type: 'Set chefPotRimHitRef';
          chefPotRimHitRef: React.RefObject<Rect>;
        }
      | {
          type: 'Lay an egg';
          henId: string;
          henPosition: Position;
          henCurentTweenSpeed: number;
          henCurrentTweenDirection: Direction['value'];
          eggColor: EggColor;
          hatchRate: number;
        }
      | {
          type: 'Egg position updated';
          eggId: string;
          eggColor: EggColor;
          position: Position;
        }
      | CountdownTimerTickEvent;
  },
  actions: {
    setChefPotRimHitRef: assign({
      chefPotRimHitRef: (_, params: React.RefObject<Rect>) => params,
    }),
    countdownTick: assign({
      remainingMS: (_, params: { remainingMS: number }) => params.remainingMS,
    }),
    decrementHensLeft: assign({
      hensLeft: ({ context }) => context.hensLeft - 1,
    }),
    removeHenActorRef: assign({
      henActorRefs: ({ context }) =>
        context.henActorRefs.filter(
          henActorRef => henActorRef.getSnapshot().status !== 'done'
        ),
    }),
    removeEggActorRef: assign({
      eggActorRefs: ({ context }) => {
        console.log('removeEggActorRef called', context.eggActorRefs);
        const remainingEggs = [];
        for (const eggActorRef of context.eggActorRefs) {
          console.log(
            'eggActorRef',
            eggActorRef.id,
            eggActorRef.getSnapshot().status
          );
          if (eggActorRef.getSnapshot().status === 'done') {
            if (context.gameConfig.isTestMode) {
              addEggToHistory({
                // id: eggActorRef.getSnapshot().context.id,
                id: eggActorRef.id,
                position: eggActorRef.getSnapshot().context.position,
                color: eggActorRef.getSnapshot().context.color,
                resultStatus: 'Caught',
              });
            }
          } else {
            remainingEggs.push(eggActorRef);
          }
        }
        return remainingEggs;
      },
    }),
    spawnNewHen: assign(({ context, spawn }) => {
      const index = context.nextHenIndex;
      const henConfig = context.population[index] as Hendividual;

      if (index >= context.population.length) {
        return {};
      }

      const nextHen = spawn(henMachine, {
        systemId: henConfig.id,
        input: {
          index: index,
          gameConfig: context.gameConfig,
          id: henConfig.id,
          henAssets: context.gameAssets.hen,
          // GA
          phenotype: henConfig.phenotype,
          // Config

          position: {
            x: henConfig.initialPosition.x,
            y: henConfig.initialPosition.y,
          },
        },
      });
      const newHenActorRefs = [...context.henActorRefs, nextHen];

      return {
        henActorRefs: newHenActorRefs,
        nextHenIndex: index + 1,
      };
    }),
    spawnNewEggForHen: assign({
      eggActorRefs: (
        { context, spawn },
        params: {
          henId: string;
          henPosition: Position;
          henCurentTweenSpeed: number;
          henButtXOffset: number;
          henButtYOffset: number;
          henCurrentTweenDirection: Direction['value'];
          eggColor: EggColor;
          hatchRate: number;
        }
      ) => {
        const eggId = nanoid();
        // Spawn and add a new egg.
        return [
          ...context.eggActorRefs,
          spawn(eggMachine, {
            systemId: eggId,
            input: {
              gameConfig: context.gameConfig,
              id: eggId,
              eggAssets: context.gameAssets.egg,
              chickAssets: context.gameAssets.chick,
              position: {
                x: params.henPosition.x + params.henButtXOffset,
                y: params.henPosition.y + params.henButtYOffset,
              },
              color: params.eggColor,
              henId: params.henId,
              henIsMoving: params.henCurentTweenSpeed > 0,
              henCurentTweenSpeed: params.henCurentTweenSpeed,
              rotationDirection: (-1 *
                params.henCurrentTweenDirection) as Direction['value'],
              hatchRate: params.hatchRate,
            },
          }),
        ];
      },
    }),
    tellChefHeCaughtAnEgg: sendTo(
      'chefMachine',
      (_, params: { eggColor: EggColor }) => ({
        type: 'Catch',
        eggColor: params.eggColor,
      })
    ),
    tellEggItWasCaught: sendTo(
      ({ system }, params: { eggId: string }) => system.get(params.eggId),
      { type: 'Catch' }
    ),
    spawnEggCaughtPoints: assign({
      eggCaughtPointsActorRefs: (
        { context, spawn },
        params: {
          eggColor: EggColor;
          position: Position;
        }
      ) => {
        if (params.eggColor === 'black') {
          return context.eggCaughtPointsActorRefs;
        }
        return [
          ...context.eggCaughtPointsActorRefs,
          spawn(eggCaughtPointsMachine, {
            input: {
              eggCaughtPointsId: nanoid(),
              eggColor: params.eggColor,
              position: params.position,
            },
          }),
        ];
      },
    }),
    removeEggCaughtPoints: assign({
      eggCaughtPointsActorRefs: ({ context }) =>
        context.eggCaughtPointsActorRefs.filter(
          eggCaughtPointsActorRef =>
            eggCaughtPointsActorRef.getSnapshot().status !== 'done'
        ),
    }),
    updateHenStatsForEggLaid: assign(
      (
        { context },
        params: {
          henId: string;
          eggColor: EggColor;
        }
      ) => {
        const updatedHenStatsById = {
          ...context.henStatsById,
        };

        const thisIndividualHen = updatedHenStatsById[params.henId];
        if (thisIndividualHen) {
          thisIndividualHen.stats.eggsLaid += 1;
        }

        const updatedLevelStats = {
          ...context.levelStats,
          totalEggsLaid: context.levelStats.totalEggsLaid + 1,
        };

        if (params.eggColor === 'black') {
          updatedLevelStats.totalBlackEggsLaid += 1;
        } else if (params.eggColor === 'gold') {
          updatedLevelStats.totalGoldEggsLaid += 1;
        } else {
          updatedLevelStats.totalWhiteEggsLaid += 1;
        }

        return {
          levelStats: updatedLevelStats,
          henStatsById: updatedHenStatsById,
        };
      }
    ),
    updateScoreForEggDone: assign({
      scoreData: (
        { context },
        params: {
          henId: string;
          eggId: string;
          eggColor: EggColor;
          resultStatus: EggResultStatus;
        }
      ) => {
        if (params.resultStatus === 'Caught') {
          const newScoreData = { ...context.scoreData };

          // Increment the egg count for the color caught
          newScoreData.eggsCaught[params.eggColor] += 1;

          // Increment the level score based on the egg color
          if (params.eggColor === 'black') {
            // Wipe out the level score if a black egg is caught
            newScoreData.levelScore = 0;
          } else {
            newScoreData.levelScore +=
              context.gameConfig.egg.points[params.eggColor];
          }

          return newScoreData;
        }
        return context.scoreData;
      },
    }),
    updateHenStatsForEggDone: assign(
      (
        { context },
        params: {
          henId: string;
          eggId: string;
          eggColor: EggColor;
          resultStatus: EggResultStatus;
        }
      ) => {
        const updatedHenStatsById = {
          ...context.henStatsById,
        };

        const updatedHenStats = {
          ...context.henStatsById[params.henId]?.stats,
        } as Hendividual['stats'];

        const updatedLevelStats = {
          ...context.levelStats,
        };

        switch (params.resultStatus) {
          case 'Caught':
            // Update eggs caught, tracked by color
            updatedHenStats.eggsCaught[params.eggColor] += 1;

            updatedLevelStats.totalEggsCaught += 1;
            if (params.eggColor === 'black') {
              updatedLevelStats.totalBlackEggsCaught += 1;
            } else if (params.eggColor === 'gold') {
              updatedLevelStats.totalGoldEggsCaught += 1;
            } else {
              updatedLevelStats.totalWhiteEggsCaught += 1;
            }
            break;
          case 'Hatched':
            updatedHenStats.eggsHatched += 1;
            updatedLevelStats.totalEggsHatched += 1;
            break;
          case 'Broken':
            updatedHenStats.eggsBroken += 1;
            updatedLevelStats.totalEggsBroken += 1;
            break;
          case 'Offscreen':
            updatedHenStats.eggsOffscreen += 1;
            updatedLevelStats.totalEggsOffscreen += 1;
        }

        const thisIndividualHen = updatedHenStatsById[params.henId];
        if (thisIndividualHen) {
          thisIndividualHen.stats = updatedHenStats;
        }

        return {
          henStatsById: updatedHenStatsById,
          levelStats: updatedLevelStats,
        };
      }
    ),
    calculateLevelStatsAverages: assign({
      levelStats: ({ context }) => {
        const totalHens = context.population.length;

        return {
          ...context.levelStats,

          // Generation Stats
          // Overall info
          generationNumber: context.generationNumber,
          catchRate:
            context.levelStats.totalEggsCaught /
            context.levelStats.totalEggsLaid,

          // Average phenotype values
          averageHenSpeed:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.speed,
              0
            ) / totalHens,
          averageBaseTweenDurationSeconds:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.baseTweenDurationSeconds,
              0
            ) / totalHens,
          averageStationaryEggLayingRate:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.stationaryEggLayingRate,
              0
            ) / totalHens,
          averageMovingEggLayingRate:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.movingEggLayingRate,
              0
            ) / totalHens,
          averageHatchRate:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.hatchRate,
              0
            ) / totalHens,
          averageMinXMovement:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.minXMovement,
              0
            ) / totalHens,
          averageMaxXMovement:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.maxXMovement,
              0
            ) / totalHens,
          averageMinStopMS:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.minStopMS,
              0
            ) / totalHens,
          averageMaxStopMS:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.maxStopMS,
              0
            ) / totalHens,
          averageMaxEggs:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.maxEggs,
              0
            ) / totalHens,
          averageBlackEggRate:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.blackEggRate,
              0
            ) / totalHens,
          averageGoldEggRate:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.goldEggRate,
              0
            ) / totalHens,
          averageRestAfterLayingEggMS:
            context.population.reduce(
              (acc, hen) => acc + hen.phenotype.restAfterLayingEggMS,
              0
            ) / totalHens,

          // Average stats
          averageEggsLaid: context.levelStats.totalEggsLaid / totalHens,
          averageEggsCaught: context.levelStats.totalEggsCaught / totalHens,
          averageEggsHatched: context.levelStats.totalEggsHatched / totalHens,
          averageEggsBroken: context.levelStats.totalEggsBroken / totalHens,
          averageEggsOffscreen:
            context.levelStats.totalEggsOffscreen / totalHens,
        };
      },
    }),
    startBackgroundMusic: () => {
      sounds.backgroundLoop.play();
    },
    stopBackgroundMusic: () => {
      sounds.backgroundLoop.stop();
    },
    playEggLaidSound: () => {
      sounds.layEgg.play();
    },
    playCatchEggSound: () => {
      sounds.catch.play();
    },
    cleanupLevelRefs: assign({
      henActorRefs: [],
      eggActorRefs: [],
    }),
  },
  actors: {
    chefMachine,
    countdownTimer,
  },
  guards: {
    areAllHensDone: ({ context }) => context.hensLeft === 0,
    isAnEggActorDone: (_, params: { eggId: string }) => {
      return !!params.eggId;
    },
    isAHenActorDone: (_, params: { henId: string }) => {
      return !!params.henId;
    },
    isEggCaughtPointsActorDone: (_, params: { eggCaughtPointsid: string }) => {
      return !!params.eggCaughtPointsid;
    },
    testPotRimHit: ({ context }, params: Position) => {
      if (!isImageRef(context.chefPotRimHitRef)) {
        return false;
      }

      const {
        x: potRimHitX,
        y: potRimHitY,
        width: potRimHitWidth,
        height: potRimHitHeight,
      } = context.chefPotRimHitRef.current.getClientRect();

      // Consider the leading edge of the egg for the hit test
      const eggLeadingEdgeYPos =
        params.y + 0.5 * context.gameConfig.egg.fallingEgg.height;

      if (eggLeadingEdgeYPos < potRimHitY) {
        return false;
      }

      return (
        params.x >= potRimHitX &&
        params.x <= potRimHitX + potRimHitWidth &&
        eggLeadingEdgeYPos >= potRimHitY &&
        eggLeadingEdgeYPos <= potRimHitY + potRimHitHeight
      );
    },
  },
}).createMachine({
  id: GAME_LEVEL_ACTOR_ID,
  context: ({ input }) => ({
    gameConfig: input.gameConfig,
    gameAssets: input.gameAssets,
    remainingMS: input.levelDuration,
    generationNumber: input.generationNumber,
    henActorRefs: [],
    eggActorRefs: [],
    eggCaughtPointsActorRefs: [],
    chefPotRimHitRef: null,
    nextHenIndex: 0,
    hensLeft: input.population.length,
    population: input.population,
    scoreData: {
      levelScore: 0,
      eggsCaught: {
        white: 0,
        gold: 0,
        black: 0,
      },
    },
    levelStats: {
      // Overall info
      generationNumber: 1,
      catchRate: 0,

      // GA values
      averageFitness: 0,
      // Average phenotype values
      averageHenSpeed: 0,
      averageBaseTweenDurationSeconds: 0,
      averageStationaryEggLayingRate: 0,
      averageMovingEggLayingRate: 0,
      averageHatchRate: 0,
      averageMinXMovement: 0,
      averageMaxXMovement: 0,
      averageMinStopMS: 0,
      averageMaxStopMS: 0,
      averageMaxEggs: 0,
      averageBlackEggRate: 0,
      averageGoldEggRate: 0,
      averageRestAfterLayingEggMS: 0,

      // Average stats
      averageEggsLaid: 0,
      averageEggsHatched: 0,
      averageEggsBroken: 0,
      averageEggsOffscreen: 0,

      // Result totals
      totalEggsBroken: 0,
      totalEggsCaught: 0,
      totalBlackEggsCaught: 0,
      totalGoldEggsCaught: 0,
      totalWhiteEggsCaught: 0,
      totalEggsHatched: 0,
      totalEggsOffscreen: 0,
      totalEggsLaid: 0,
      totalBlackEggsLaid: 0,
      totalGoldEggsLaid: 0,
      totalWhiteEggsLaid: 0,
      totalEggsSplat: 0,
    },
    henStatsById: input.population.reduce(
      (acc, individualHenConfig) => ({
        ...acc,
        [individualHenConfig.id]: individualHenConfig,
      }),
      {} as Record<string, Hendividual>
    ),
  }),
  output: ({ context }) => ({
    generationNumber: context.generationNumber,
    levelStats: context.levelStats,
    henStatsById: context.henStatsById,
    scoreData: context.scoreData,
  }),
  initial: 'Playing',
  on: {
    'Set chefPotRimHitRef': {
      actions: {
        type: 'setChefPotRimHitRef',
        params: ({ event }) => event.chefPotRimHitRef,
      },
    },
    'Lay an egg': {
      actions: [
        {
          type: 'spawnNewEggForHen',
          params: ({ context, event }) => ({
            henId: event.henId,
            henPosition: event.henPosition,
            henButtXOffset: context.gameConfig.hen.buttXOffset,
            henButtYOffset: context.gameConfig.hen.buttYOffset,
            henCurentTweenSpeed: event.henCurentTweenSpeed,
            henCurrentTweenDirection: event.henCurrentTweenDirection,
            eggColor: event.eggColor,
            hatchRate: event.hatchRate,
          }),
        },
        'playEggLaidSound',
        {
          type: 'updateHenStatsForEggLaid',
          params: ({ event }) => ({
            henId: event.henId,
            eggColor: event.eggColor,
          }),
        },
      ],
    },
    'Egg position updated': {
      guard: {
        type: 'testPotRimHit',
        params: ({ event }) => event.position,
      },
      actions: [
        {
          type: 'tellChefHeCaughtAnEgg',
          params: ({ event }) => ({
            eggColor: event.eggColor,
          }),
        },
        'playCatchEggSound',
        // Notifying the eggActor that the egg was caught leads to
        // the egg's final state and automatic removal
        {
          type: 'tellEggItWasCaught',
          params: ({ event }) => ({
            eggId: event.eggId,
          }),
        },
        {
          type: 'spawnEggCaughtPoints',
          params: ({ event }) => ({
            eggColor: event.eggColor,
            position: event.position,
          }),
        },
        emit(({ event }) => {
          assertEvent(event, 'Egg position updated');
          return {
            type: 'Egg caught',
            eggColor: event.eggColor,
          };
        }),
      ],
    },
  },
  states: {
    Playing: {
      entry: ['startBackgroundMusic', log('Game Level - Playing')],
      exit: 'stopBackgroundMusic',
      on: {
        Tick: [
          {
            guard: 'areAllHensDone',
            target: 'Done',
          },
          {
            actions: [
              {
                type: 'countdownTick',
                params: ({ event }) => ({ remainingMS: event.remainingMS }),
              },
              'spawnNewHen',
            ],
          },
        ],
        'xstate.done.actor.*': [
          // Egg actor done
          {
            guard: {
              type: 'isAnEggActorDone',
              params: ({ event }: { event: EggDoneEvent }) => ({
                eggId: event.output.eggId,
              }),
            },
            actions: [
              'removeEggActorRef',
              {
                type: 'updateScoreForEggDone',
                params: ({ event }: { event: EggDoneEvent }) => ({
                  henId: event.output.henId,
                  eggId: event.output.eggId,
                  eggColor: event.output.eggColor,
                  resultStatus: event.output.resultStatus,
                }),
              },
              {
                type: 'updateHenStatsForEggDone',
                params: ({ event }: { event: EggDoneEvent }) => ({
                  henId: event.output.henId,
                  eggId: event.output.eggId,
                  eggColor: event.output.eggColor,
                  resultStatus: event.output.resultStatus,
                }),
              },
            ],
          },
          // Hen actor done
          {
            guard: {
              type: 'isAHenActorDone',
              params: ({ event }: { event: HenDoneEvent }) => ({
                henId: event.output.henId,
              }),
            },
            actions: ['removeHenActorRef', 'decrementHensLeft'],
          },
          // Egg Caught Points actor done
          {
            guard: {
              type: 'isEggCaughtPointsActorDone',
              params: ({ event }: { event: EggCaughtPointsDoneEvent }) => ({
                eggCaughtPointsId: event.output.eggCaughtPointsId,
              }),
            },
            actions: ['removeEggCaughtPoints'],
          },
        ],
      },
      invoke: [
        {
          id: 'countdownTimer',
          src: 'countdownTimer',
          input: ({ context, self }) => ({
            parent: self,
            totalMS: context.remainingMS,
            tickMS: 1000,
          }),
        },
        {
          id: 'chefMachine',
          src: 'chefMachine',
          systemId: CHEF_ACTOR_ID,
          input: ({ context }) => ({
            gameConfig: context.gameConfig,
            chefConfig: context.gameConfig.chef,
            chefAssets: context.gameAssets.chef,
            position: {
              x: context.gameConfig.chef.x,
              y: context.gameConfig.chef.y,
            },
            speed: 0,
            speedLimit: context.gameConfig.chef.speedLimit,
            acceleration: context.gameConfig.chef.acceleration,
            deceleration: context.gameConfig.chef.acceleration,
            minXPos: context.gameConfig.chef.minXPos,
            maxXPos: context.gameConfig.chef.maxXPos,
            isTestMode: context.gameConfig.isTestMode,
          }),
        },
      ],
    },
    Done: {
      type: 'final',
      tags: 'summary',
      entry: ['calculateLevelStatsAverages', 'cleanupLevelRefs'],
    },
  },
});
