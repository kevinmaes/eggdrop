import { assertEvent, assign, fromPromise, log, setup } from 'xstate';
import type { ChefActorRef } from '../../src/Chef/chef.machine';
import type { GameLevelActorRef } from '../../src/GameLevel/gameLevel.machine';
import type { AppActorRef } from '../../src/app.machine';
import type { EggActorRef } from '../../src/Egg/egg.machine';

// Import only the IDs as values
import {
  APP_ACTOR_ID,
  GAME_LEVEL_ACTOR_ID,
  CHEF_ACTOR_ID,
} from '../../src/constants';
import {
  ChefAndEggsData,
  ChefData,
  EggData,
  EggHistoryEntry,
} from '../../src/test-api';
import { Page } from '@playwright/test';
import { GameConfig } from '../../src/gameConfig';
import { findBestEgg } from './helpers';

// Add new interface for enhanced egg data
interface EnhancedEggData extends EggData {
  speedY: number;
  timeToCatch: number;
  maxTravel: number;
  isReachable: boolean;
  score: number;
}

type GameActorId =
  | typeof APP_ACTOR_ID
  | typeof GAME_LEVEL_ACTOR_ID
  | typeof CHEF_ACTOR_ID;
type AnyGameActorRef = AppActorRef | GameLevelActorRef | ChefActorRef;

const CHEF_BOT_ACTOR_ID = 'Chef Bot';
const chefBotMachine = setup({
  types: {} as {
    input: {
      page: Page;
    };
    context: {
      page: Page;
      gameConfig: GameConfig | null;
      chef: ChefData | null;
      targetEgg: EggData | null;
      expectedScore: number;
    };
    events:
      | { type: 'Start' }
      | { type: 'Next' }
      | {
          type: 'Register game actor';
          data: { actorId: string; actor: AnyGameActorRef };
        }
      | {
          type: 'Register egg actor';
          data: { actorId: string; actor: EggActorRef };
        }
      | {
          type: 'xstate.done.actor.0.Chef Bot.Analyzing';
          output: ChefAndEggsData;
        };
  },
  guards: {
    'is game app ready': (_, params: GameConfig | undefined) => !!params,
    'was target egg caught': (_, params: EggHistoryEntry | undefined) => {
      return params !== undefined && params.resultStatus === 'Caught';
    },
    'are there more eggs': (_, params: { moreEggs: boolean }) =>
      params.moreEggs,
  },
  actions: {
    updateExpectedScore: assign({
      expectedScore: ({ context }, params: EggHistoryEntry | undefined) => {
        if (params === undefined) {
          return context.expectedScore;
        }
        if (params.resultStatus === 'Caught') {
          switch (params.color) {
            case 'gold':
              return context.expectedScore + 5;
            case 'white':
              return context.expectedScore + 1;
            default:
              return 0;
          }
        }

        return context.expectedScore;
      },
    }),
  },
  actors: {
    fetchGameConfig: fromPromise<GameConfig | undefined, { page: Page }>(
      async ({ input }) => {
        // console.log('checkForAppActorRef called');
        const { page } = input;
        const gameConfig = await page.evaluate(() => {
          const testAPI = window.__TEST_API__;
          return testAPI?.getGameConfig();
        });
        if (!gameConfig) {
          throw new Error('No app actor nor game config found');
        }
        return gameConfig;
      }
    ),
    getChefAndEggsData: fromPromise<ChefAndEggsData, { page: Page }>(
      async ({ input }) => {
        const { page } = input;
        const chefAndEggsDataHandle = await page.waitForFunction(() => {
          const chefAndEggsData = window.__TEST_API__?.getChefAndEggsData();
          if (chefAndEggsData === undefined) {
            return null;
          }
          if (chefAndEggsData.eggs.length === 0) {
            // console.log('chefAndEggsData with no eggs');
            return null;
          }
          return chefAndEggsData;
        });
        const chefAndEggsData = await chefAndEggsDataHandle.jsonValue();
        if (chefAndEggsData === null) {
          throw new Error('No chef and eggs data found');
        }
        return chefAndEggsData;
      }
    ),
    chooseNextEgg: fromPromise<
      EggData | null,
      { page: Page; chefAndEggsData: ChefAndEggsData }
    >(async ({ input }) => {
      const { chefAndEggsData } = input;
      const { chef, eggs } = chefAndEggsData;

      const bestEgg = findBestEgg(eggs, chef);

      if (!bestEgg) {
        throw new Error('No valid egg target was found');
      }

      return bestEgg;
    }),
    moveChefToEgg: fromPromise<
      ChefData | null,
      { page: Page; targetEgg: EggData | null }
    >(async ({ input }) => {
      // console.log('moveChefToEgg called with input', input.targetEgg);
      const { page, targetEgg } = input;

      if (targetEgg === null) {
        throw new Error(
          'No target egg id provided so can not move chef to target'
        );
      }

      // Determine which direction to move the chef to the target egg
      const chefXPos = await page.evaluate(() => {
        const testAPI = window.__TEST_API__;
        return testAPI?.getChefPosition().position.x;
      });

      if (chefXPos === undefined) {
        throw new Error('Failed to get chef position');
      }

      const targetEggXPos = targetEgg.position.x;

      const keyToPress = targetEggXPos < chefXPos ? 'ArrowLeft' : 'ArrowRight';

      await page.keyboard.down(keyToPress);

      // Wait until the chef is in a position to catch the target egg
      // and then return the serialized chef data.
      const chefDataHandle = await page.waitForFunction(
        ({
          targetEggId,
          gameLevelActorId,
        }: {
          targetEggId: string;
          gameLevelActorId: string;
        }) => {
          const testAPI = window.__TEST_API__;
          const appActorRef = testAPI?.app;
          const gameLevelActorRef = appActorRef?.system.get(
            gameLevelActorId
          ) as GameLevelActorRef;
          const gameLevelContext = gameLevelActorRef?.getSnapshot().context;

          const targetEggActorRef = gameLevelContext.eggActorRefs.find(
            (egg) => {
              return egg.id === targetEggId;
            }
          );

          if (!targetEggActorRef) {
            throw new Error('Target egg actor ref not found');
          }

          const targetEggXPosition =
            targetEggActorRef.getSnapshot().context.position.x;

          const chefData = testAPI?.getChefPosition();
          if (!chefData) {
            return null;
          }
          const chefPotRimCenterHitX = chefData.potRimCenterOffsetX;

          if (
            chefData.movingDirection === 'right' &&
            chefPotRimCenterHitX >= targetEggXPosition
          ) {
            console.log('right eggX', targetEggXPosition);
            console.log('right cheffPotCenterX', chefPotRimCenterHitX);
            console.log('right chef positionX', chefData.position.x);
            return chefData;
          } else if (
            chefData.movingDirection === 'left' &&
            chefPotRimCenterHitX <= targetEggXPosition
          ) {
            console.log('left eggX', targetEggXPosition);
            console.log(
              'left cheffPotCenterX',
              Math.round(chefPotRimCenterHitX)
            );
            console.log('left chef positionX', Math.round(chefData.position.x));
            return chefData;
          }
          return null;
        },
        {
          targetEggId: targetEgg.id,
          gameLevelActorId: GAME_LEVEL_ACTOR_ID,
        },
        { timeout: 10_000 }
      );

      await page.keyboard.up(keyToPress);

      const chefData = await chefDataHandle.jsonValue();
      // console.log('chefData', chefData);
      return chefData;
    }),
    waitToCatchTargetEgg: fromPromise<
      EggHistoryEntry | undefined,
      { page: Page; targetEggId: string }
    >(async ({ input }) => {
      // console.log('waitToCatchTargetEgg called');
      const { page, targetEggId } = input;
      const doneEgg = await page.waitForFunction(
        ({ targetEggId }: { targetEggId: string }) => {
          // Check for the existence of the target egg in the eggHistory
          const testAPI = window.__TEST_API__;
          const targetEggInHistory = testAPI?.findEggInHistory(targetEggId);
          return targetEggInHistory;
        },
        { targetEggId: targetEggId },
        { timeout: 5000 }
      );

      return doneEgg.jsonValue();
    }),
    checkForMoreEggs: fromPromise<{ moreEggs: boolean }, { page: Page }>(
      async ({ input }) => {
        const { page } = input;
        const moreEggs = await page.evaluate(() => {
          const testAPI = window.__TEST_API__;
          return testAPI?.areThereMoreEggs();
        });
        return { moreEggs: !!moreEggs };
      }
    ),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGEAWYBmACAQgewBcA6ASQgBswBiAZQIEMAnAgbQAYBdRUABz1gCWBAXgB23EAA9EATgDsAViIKAjDJkAWOSrkAmAMy7dMgDQgAnogAcN5Wzba2+q2wUb1AXw9m0mXIVJRIQF6cgEALwFRKCoIMTAiKIA3PABrBN9sfGISIOFQiKioBGS8AGN6YTF2DhqJPkEq8SQpRBUANnaVIg19fTcZfS63BXazSwQrdqsiQzk2GQUFfTYOhTkvH3QsgNzggsjo2PjE0RT0okz-HLyQsMPi0oqmmpYVLhaG4LEJaQQOro9PoDIYqEZjCyyBQyZQyFQaJxyTpWQwqTYgK7ZQL7e5FKhgRiMPCMIg8ciVDDEgC2l2212x+Vx0RKZ3KlREolenHq-G+zVAf3hujYRBUHV07T6bA07VcVnG1mFoqW2hWbF0bg16MxAQAgqJQuYHsdRAlShcdcR9YaHiyUs8OVyPrxeU1fm05JpZr0kVNPUt2hoFZNuiorGGFLoEUM2O1Rtq6VjreQjXiCUSSWSKdTaX4kwaU7anuzqpw6p9XRz3QgDPoYXCjBobE2XKNgypVkRNPoxVZPYHpe0ZAm8wE0HhedEsAA5MCSAhYACiUBicVNp3OGUTY9QE8EU9n86XK7tbJeZe5FcaVZaf3kSlU6i0OgMRlMkP+6iILhk7UUsbUBQHBHHZiHHScoBnOcF2XGJ02JUlyQISlGBpS1aT3IooKPWDTwdUtakvF1rx+W9ZEUZQ1E0bQ9EMYxg30XpRV0KxRncYxUQ0ED6QAdXoYIpwAFTwLBwNgMAsH1Qh0EYY8YkkWAGAIBJ6AwZTGAACiAtgAEoqHQviBMg4TRN3fgJKkggZLk8tiL5asAW6Xp+ncUFwQYhQZjBGUEQWYx1hRbisQAWTwJI8TXM1WQtbdiFC8LmWLc9COdEAvjdMj-jBORZnUXQ5HcKx3CbBQGKsGFnA0Iwll0NR5g0BQgoCeK00JBCs2QnN0JaxLWXwzkL1S9KbwFNpOic4FXOGBqIQmYUNFmZxnEjFRnElOQNm8DFYsuSoylQCKTnNLdRzAvaDt6+0SwGlKeRI-lWgQHsZljPoaKWFENB0YNVBFFiZHDeQOzhTR2ias6CH21qM0Q7NUNzUDdshi7Hj666nTu+zMueohXv0d7PMY76Pz-GF1X6Tzm2FQZwaIRcklCABXdkjkijc0hOxH6aZlnUau5LbLSytSNGhB70op8aNfeiP3WfQiGmDaNo0XobCRWnufIZnhFZo7os5+lNe1oo8PRst3kxjLRfFx9qJfOj3wmSMct6YUUSjL6o2HdFRDwCA4AkS1LZGx6AFpZsQcPabIShg5Fx6bHaBWFhc-7fN0YMbBmZxar9HsNR0aPbgOIo44ewUESUHtoUYmQnD-IdM+0HoxX6FE1AMNgrFp5NU2iMvq2FCjtPxjUhyjVbM6ToDGP6GQ3bbtEtvQsSsMPGCVwHzKCu6OsGtW6FFZUdtw2-Ic8rDSVwymWnDJ14yRLEizfasgk5K30XVo2ogF5UN2pmMBHJ6fQf7SnyqxVwTY-xcWXjtHqUAP6PVWvPWEyxhSynxveYMwpdC41lLKfevooxg1gadJGUN+5XixqLKqP1XCUWFHWVYWgc4awZlrXmiC-h6CUL0BYVh8pQM0HQl6f8nB13hHIVhpCuZtUYFwxAGpPREFol9TQvQfRyHbPCZQr5Vj2ARJKVQtMAAi8QFH-HsMoeYv4AYq0DF0IMJMhgKxVKtewGoqqNS8B4IAA */
  id: CHEF_BOT_ACTOR_ID,
  context: ({ input }) => ({
    page: input.page,
    gameConfig: null,
    chef: null,
    targetEgg: null,
    expectedScore: 0,
  }),
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        Start: 'Initializing',
      },
    },
    Initializing: {
      entry: log(`${CHEF_BOT_ACTOR_ID} Initializing`),
      invoke: {
        src: 'fetchGameConfig',
        input: ({ context }) => ({ page: context.page }),
        onDone: [
          {
            guard: {
              type: 'is game app ready',
              params: ({ event }) => event.output,
            },
            target: 'Analyzing',
            actions: assign({
              gameConfig: ({ event }) => {
                if (event.output) {
                  return event.output;
                }
                return null;
              },
            }),
          },
          {
            target: 'Error',
          },
        ],
        onError: {},
      },
    },
    Analyzing: {
      entry: log(`${CHEF_BOT_ACTOR_ID} Analyzing`),
      invoke: {
        src: 'getChefAndEggsData',
        input: ({ context }) => {
          return { page: context.page };
        },
        onDone: {
          target: 'Choosing Next Egg',
        },
        onError: {
          target: 'Error',
          actions: log('Failed to get chef and eggs data'),
        },
      },
    },
    'Choosing Next Egg': {
      entry: log(`${CHEF_BOT_ACTOR_ID} Choosing Next Egg`),
      invoke: {
        src: 'chooseNextEgg',
        input: ({ context, event }) => {
          assertEvent(event, 'xstate.done.actor.0.Chef Bot.Analyzing');
          return {
            page: context.page,
            chefAndEggsData: event.output,
          };
        },
        onDone: {
          target: 'Moving',
          actions: assign({
            targetEgg: ({ event }) => event.output,
          }),
        },
        onError: {
          target: 'Waiting To Choose Another Egg',
        },
      },
    },
    'Waiting To Choose Another Egg': {
      entry: log(`${CHEF_BOT_ACTOR_ID} Waiting To Choose Another Egg`),
      after: {
        500: 'Analyzing',
      },
    },
    Moving: {
      entry: [log(`${CHEF_BOT_ACTOR_ID} Moving`)],
      invoke: {
        src: 'moveChefToEgg',
        input: ({ context }) => ({
          page: context.page,
          targetEgg: context.targetEgg,
        }),
        onDone: 'Catching',
        onError: {
          target: 'Analyzing',
          actions: [
            log('Failed to move to target egg position'),
            ({ event }) => {
              console.log('Error:', event.error);
            },
          ],
        },
      },
    },
    Catching: {
      entry: log(`${CHEF_BOT_ACTOR_ID} Catching`),
      invoke: {
        src: 'waitToCatchTargetEgg',
        input: ({ context }) => ({
          page: context.page,
          targetEggId: context.targetEgg?.id ?? '',
        }),
        onDone: [
          {
            guard: {
              type: 'was target egg caught',
              params: ({ event }) => event.output,
            },
            target: 'Evaluating',
            actions: [
              log('Target egg caught'),
              {
                type: 'updateExpectedScore',
                params: ({ event }) => event.output,
              },
            ],
          },
        ],
        onError: {
          target: 'Analyzing',
          actions: log('Failed to catch target egg'),
        },
      },
    },
    Evaluating: {
      entry: log(`${CHEF_BOT_ACTOR_ID} Evaluating`),
      invoke: {
        src: 'checkForMoreEggs',
        input: ({ context }) => ({
          page: context.page,
        }),
        onDone: [
          {
            guard: {
              type: 'are there more eggs',
              params: ({ event }) => event.output,
            },
            target: 'Analyzing',
          },
          {
            target: 'Waiting To Choose Another Egg',
          },
        ],
      },
    },
    Error: {
      entry: log(`${CHEF_BOT_ACTOR_ID} Error`),
      // type: 'final',
    },
    Done: {
      entry: log(`${CHEF_BOT_ACTOR_ID} Done`),
      type: 'final',
    },
  },
});

export { chefBotMachine };
