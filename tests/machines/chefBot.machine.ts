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
import { GameConfig } from '../../src/GameLevel/gameConfig';

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
    isGameAppReady: (_, params: GameConfig | undefined) => !!params,
    wasTargetEggCaught: (_, params: EggHistoryEntry | null) => {
      return params !== null && params.resultStatus === 'Caught';
    },
  },
  actions: {
    updateExpectedScore: assign({
      expectedScore: ({ context }, params: EggHistoryEntry | null) => {
        if (params === null) {
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
    checkForAppActorRef: fromPromise<GameConfig | undefined, { page: Page }>(
      async ({ input }) => {
        console.log('checkForAppActorRef called');
        const { page } = input;
        const gameConfig = await page.evaluate(() => {
          const testAPI = window.__TEST_API__;
          return testAPI?.getGameConfig();
        });
        if (!gameConfig) {
          throw new Error('No app actor nor game config found');
        }
        console.log('gameConfig exists', !!gameConfig);
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
          console.log('chefAndEggsData WITH eggs', !!chefAndEggsData);
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
      console.log('chooseNextEgg called');
      const nextEgg = input.chefAndEggsData.eggs.find(
        egg => egg.color !== 'black'
      );
      if (nextEgg === undefined) {
        throw new Error('No valid egg target was found');
      }
      return nextEgg;
    }),
    moveChefToEgg: fromPromise<
      ChefData | null,
      { page: Page; targetEgg: EggData | null }
    >(async ({ input }) => {
      console.log('moveChefToEgg called with input', input.targetEgg);
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
          const gameLevelActorRef = appActorRef?.system.get(gameLevelActorId);
          const gameLevelContext = gameLevelActorRef?.getSnapshot().context;
          const eggActorRefs = gameLevelContext.eggActorRefs;

          const targetEgg = eggActorRefs.find(egg => {
            return egg.id === targetEggId;
          });

          const targetEggXPosition = targetEgg.getSnapshot().context.position.x;

          const chefData = testAPI?.getChefPosition();
          // console.log('chefData from testAPI?.getChefPosition()', chefData);
          if (!chefData) {
            console.log('no chef data found');
            return null;
          }
          // const chefXPos = chefData?.position.x;
          const chefPotRimCenterHitX = chefData.potRimCenterOffsetX;

          if (
            chefData.movingDirection === 'right' &&
            chefPotRimCenterHitX >= targetEggXPosition
          ) {
            return chefData;
          } else if (
            chefData.movingDirection === 'left' &&
            chefPotRimCenterHitX <= targetEggXPosition
          ) {
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
      EggHistoryEntry | null,
      { page: Page; targetEggId: string }
    >(async ({ input }) => {
      console.log('waitToCatchTargetEgg called');
      const { page, targetEggId } = input;
      const doneEgg = await page.waitForFunction(
        ({ targetEggId }: { targetEggId: string }) => {
          // Check for the existence of the target egg in the eggHistory
          const testAPI = window.__TEST_API__;
          const targetEggInHistory = testAPI?.findEggInHistory(targetEggId);
          if (!targetEggInHistory) {
            return null;
          }
          return targetEggInHistory;
        },
        { targetEggId: targetEggId },
        { timeout: 5000 }
      );

      return doneEgg.jsonValue();
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGMAWYBmAhA9gFwDoBJCAGzAGIBlPAQwCc8BtABgF1FQAHHWASzx8cAO04gAHogC0ARgAsAJgIBWOcpYB2FpoCcLBcp0AOADQgAntJkA2AtZlHryjXL0OdGjdYC+3s2kxcQiJhAT5aUj4ALz5hKAoIETACWIA3HABrZIDsfGJQwQjo2KgENJxkWkERVjZasR5+atEkCWk9Ag1jHTlPPU0WAGYFM0sEGUG5AhlVeUGhrSMl3390XOCC8MiYuISklOF0rIIcoPywop3S8srm2qYZDlbGsJExSQRhnQIFFiNVOTyOT6IwyUaICZTGaAuTzQaLZZ+ECnPIhC7bEoUMD0eg4egELikKoYPEAWxOazOaMKGLiZUOFSqQmE93YDV4rxaoA+UgMSicwMG1h0OncGgUYIsiB0ygIriMItFHg0gyMvRWyMpeQAgsIIuYrhQAHJgcTMNnPDnNd6IawsH59IyDGQKXp-HQGcEIBTighGIbzCV-DSgnxIlGEACyOFSmJNZvqlqazJtCDtDq6TpdboVnqlCFhUzk1nhWmBLB0qpkGojBAAwlU0HHTeantwrSnWh90z7M87XYsPcovXaZHYhdYSx6Q+KdDWtYQAKKpCIAVyZu3jrfZybeXekCnhdhmvw8SpkGmUI3zl40di6cwUMrVCnngTyy7XG-iW4ebZALzWvuCCyKKBDGAo1gKAojjKEYEo+l6TrfFoHqTPMs4Xr4SLCDgEBwGIEY7pyqZSPM9oCkMwqigq4perIErgV4HgKkshiwsob7rMQZBgMRQHcgeqp2K6wpeE4Toqho9E2H6arqIYTp2iwUFcVSmyXCU-GdoJIGQX6h4Sk4Njwg4Mz0ZMnQKsKToGA4IZqTqeqkAaWlJiRwGKOBbgSi+h5ONeYy-HeCq9D08L9o4gyOVGMZue2u5cm0CBXj8ygyA4chLCWPoil6gyqAQzpwWoah6CKBgxfWjaoPFAEdnuunFtM9iun8MgyleQzDvm6VKC4kwsBl0G6GGqzvkuK6kOughxNpjXJYCBAsIoijWHIWVaA4gwjh0NHaNC0EyJoVWLjieLzUlHwuEoEpdJBTrOh6OhesdIXaL0MyZc61bhguBAACJJJdqaKEhwkdcoUMaDYoKSdh3hAA */
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
        src: 'checkForAppActorRef',
        input: ({ context }) => ({ page: context.page }),
        onDone: [
          {
            guard: {
              type: 'isGameAppReady',
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
            targetEgg: ({ event }) => {
              console.log('targetEgg assign', event.output);
              return event.output;
            },
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
        1000: 'Analyzing',
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
          target: 'Choosing Next Egg',
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
              type: 'wasTargetEggCaught',
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
          target: 'Choosing Next Egg',
          actions: log('Failed to catch target egg'),
        },
      },
    },
    Evaluating: {
      entry: log(`${CHEF_BOT_ACTOR_ID} Evaluating`),
      always: [
        {
          // guard: 'if there are still more eggs',
          target: 'Analyzing',
        },
        {
          target: 'Done',
        },
      ],
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
