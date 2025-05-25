import { assign, fromPromise, log, setup } from 'xstate';
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
        };
  },
  guards: {
    isGameAppReady: (_, params: GameConfig | undefined) => !!params,
    wasTargetEggCaught: (_, params: EggHistoryEntry | null) => {
      return params !== null && params.resultStatus === 'Caught';
    },
  },
  actions: {
    chooseNextEgg: assign({
      targetEgg: (_, params: ChefAndEggsData) => {
        console.log('chooseNextEgg called with params', params);
        const nextEgg = params.eggs.find(egg => egg.color !== 'black');
        console.log('nextEgg', nextEgg);
        if (nextEgg) {
          return nextEgg;
        }
        return null;
      },
    }),
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
        const gameConfig = await input.page.evaluate(() => {
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
        const chefAndEggsDataHandle = await input.page.waitForFunction(() => {
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
    moveChefToEgg: fromPromise<
      ChefData | null,
      { page: Page; targetEggId: string }
    >(async ({ input }) => {
      console.log('moveChefToEgg called with input', input.targetEggId);
      if (typeof input.targetEggId === 'undefined') {
        return null;
      }
      console.log('moveChefToEgg after targetEggId check');
      const chefDataHandle = await input.page.waitForFunction(
        ({ targetEggId }: { targetEggId: string }) => {
          console.log('moveChefToEgg waitForFunction called');
          const testAPI = window.__TEST_API__;
          // console.log('testAPI', !!testAPI);

          const appActorRef = testAPI?.app;
          console.log('appActorRef', !!appActorRef);

          // const chefActorRef = appActorRef?.system.get(CHEF_ACTOR_ID);
          // console.log('chefActorRef', !!chefActorRef);

          const gameLevelActorRef =
            appActorRef?.system.get(GAME_LEVEL_ACTOR_ID);
          console.log('gameLevelActorRef', !!gameLevelActorRef);

          // return null;
          // return {} as ChefData;

          const gameLevelSnapshot = gameLevelActorRef?.getSnapshot();
          console.log('gameLevelSnapshot', !!gameLevelSnapshot);
          const gameLevelContext = gameLevelSnapshot.context;
          console.log('gameLevelContext', !!gameLevelContext);

          const eggActorRefs = gameLevelContext.eggActorRefs;
          console.log('eggActorRefs', !!eggActorRefs);

          const targetEgg = eggActorRefs.find(egg => {
            console.log('egg', egg.systemId, targetEggId);
            return egg.systemId === targetEggId;
          });

          console.log('found target egg', !!targetEgg);
          // if (!targetEgg) return null;

          const targetEggPosition = targetEgg.getSnapshot().context.position;

          const chefData = testAPI?.getChefPosition();
          if (!chefData) return null;
          if (
            chefData.movingDirection === 'right' &&
            chefData.position.x >= targetEggPosition.position.x
          ) {
            return chefData;
          } else if (
            chefData.movingDirection === 'left' &&
            chefData.position.x <= targetEggPosition.position.x
          ) {
            return chefData;
          }
          return null;
        },
        { targetEggId: input.targetEggId },
        { timeout: 10000 }
      );

      const chefData = await chefDataHandle.jsonValue();
      console.log('chefData returned', chefData);
      return chefData;
    }),
    waitToCatchTargetEgg: fromPromise<
      EggHistoryEntry | null,
      { page: Page; targetEggId: string }
    >(async ({ input }) => {
      const doneEgg = await input.page.waitForFunction(
        ({ targetEggId }: { targetEggId: string }) => {
          // Check for the existence of the target egg in the eggHistory
          const testAPI = window.__TEST_API__;
          const targetEggInHistory = testAPI?.findEggInHistory(targetEggId);
          if (!targetEggInHistory) return null;
          return targetEggInHistory;
        },
        { targetEggId: input.targetEggId },
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
        onDone: [
          {
            target: 'Moving',
            actions: {
              type: 'chooseNextEgg',
              params: ({ event }) => event.output,
            },
          },
        ],
        onError: {
          target: 'Error',
          actions: log('Failed to get chef and eggs data'),
        },
      },
    },
    Moving: {
      entry: log(`${CHEF_BOT_ACTOR_ID} Moving`),
      invoke: {
        src: 'moveChefToEgg',
        input: ({ context }) => ({
          page: context.page,
          targetEggId: context.targetEgg?.id ?? '',
        }),
        onDone: 'Catching',
        onError: {
          target: 'Error',
          actions: log('Failed to move to target egg position'),
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
          target: 'Error',
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
