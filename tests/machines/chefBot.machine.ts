import { fromPromise, log, setup } from 'xstate';
import type { ChefActorRef } from '../../src/Chef/chef.machine';
import type { GameLevelActorRef } from '../../src/GameLevel/gameLevel.machine';
import type { AppActorRef } from '../../src/app.machine';
import type { EggActorRef } from '../../src/Egg/egg.machine';
import { eventBus } from '../../src/shared/eventBus';
import { assign } from 'xstate';

// Import only the IDs as values
import {
  APP_ACTOR_ID,
  GAME_LEVEL_ACTOR_ID,
  CHEF_ACTOR_ID,
} from '../../src/constants';
import { ChefData, EggData } from '../../src/test-api';
import { Page } from '@playwright/test';

type GameActorId =
  | typeof APP_ACTOR_ID
  | typeof GAME_LEVEL_ACTOR_ID
  | typeof CHEF_ACTOR_ID;
type AnyGameActorRef = AppActorRef | GameLevelActorRef | ChefActorRef;

const chefBotMachine = setup({
  types: {} as {
    input: {
      page: Page;
    };
    context: {
      page: Page;
      chef: ChefData | null;
      eggsData: EggData[];
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
    isAppActorReady: (_, params: { isReady }) => params.isReady,
    'if there are still more eggs': ({ context }) => {
      return false;
      // return (
      //   ((
      //     context.gameActors.get(GAME_LEVEL_ACTOR_ID) as GameLevelActorRef
      //   )?.getSnapshot().context.eggActorRefs.length ?? 0) > 0
      // );
    },
  },
  actions: {},
  actors: {
    checkForAppActorRef: fromPromise<{ isReady: boolean }, { page: Page }>(
      async ({ input }) => {
        const appActorRef = await input.page.evaluate(() => {
          return window.__TEST_API__?.app;
        });
        return {
          isReady: !!appActorRef,
        };
      }
    ),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGMAWYBmAhA9gFwDoBJCAGzAGIBlPAQwCc8BtABgF1FQAHHWASzx8cAO04gAHogC0ARgAsAJgIBWOcpYB2FpoCcLBcp0AOADQgAntJkA2AtZlHryjXL0OdGjdYC+3s2kxcQiJhAT5aUj4ALz5hKAoIETACWIA3HABrZIDsfGJQwQjo2KgENJxkWkERVjZasR5+atEkCWk9Ag1jHTlPPU0WAGYFM0sEGUG5AhlVeUGhrSMl3390XOCC8MiYuISklOF0rIIcoPywop3S8srm2qYZDlbGsJExSQRhnQIFFiNVOTyOT6IwyUaICZTGaAuTzQaLZZ+ECnPIhC7bEoUMD0eg4egELikKoYPEAWxOazOaMKGLiZUOFSqQmE93YDV4rxaoA+UgMSicwMG1h0OncGgUYIsiB0ygIriMItFHg0gyMvRWyMpeQAgsIIuYrhQAHJgcTMNnPDnNd6IawsH59IyDGQKXp-HQGcEIBTighGIbzCV-DSgnxIlGEACyOFSmJNZvqlqazJtCDtDq6TpdboVnqlCFhUzk1nhWmBLB0qpkGojBAAwlU0HHTeantwrSnWh90z7M87XYsPcovXaZHYhdYSx6Q+KdDWtYQAKKpCIAVyZu3jrfZybeXekCnhdhmvw8SpkGmUI3zl40di6cwUMrVCnngTyy7XG-iW4ebZALzWvuCCyKKBDGAo1gKAojjKEYEo+l6TrfFoHqTPMs4Xr4SLCDgEBwGIEY7pyqZSPM9oCkMwqigq4perIErgV4HgKkshiwsob7rMQZBgMRQHcgeqp2K6wpeE4Toqho9E2H6arqIYTp2iwUFcVSmyXCU-GdoJIGQX6h4Sk4Njwg4Mz0ZMnQKsKToGA4IZqTqeqkAaWlJiRwGKOBbgSi+h5ONeYy-HeCq9D08L9o4gyOVGMZue2u5cm0CBXj8ygyA4chLCWPoil6gyqAQzpwWoah6CKBgxfWjaoPFAEdnuunFtM9iun8MgyleQzDvm6VKC4kwsBl0G6GGqzvkuK6kOughxNpjXJYCBAsIoijWHIWVaA4gwjh0NHaNC0EyJoVWLjieLzUlHwuEoEpdJBTrOh6OhesdIXaL0MyZc61bhguBAACJJJdqaKEhwkdcoUMaDYoKSdh3hAA */
  id: 'chefBot',
  context: ({ input }) => ({
    page: input.page,
    chef: null,
    eggsData: [],
  }),
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        Start: 'Initializing',
      },
    },
    Initializing: {
      invoke: {
        src: 'checkForAppActorRef',
        input: ({ context }) => ({ page: context.page }),
        onDone: [
          {
            guard: {
              type: 'isAppActorReady',
              params: ({ event }) => event.output,
            },
            target: 'Analyzing',
          },
          {
            target: 'Error',
          },
        ],
        onError: {},
      },
    },
    Analyzing: {
      on: {
        Next: 'Moving',
      },
    },
    Moving: {
      on: {
        Next: 'Catching',
      },
    },
    Catching: {
      on: {
        Next: 'Evaluating',
      },
    },
    Evaluating: {
      on: {
        Next: [
          {
            guard: 'if there are still more eggs',
            target: 'Analyzing',
          },
          {
            target: 'Done',
          },
        ],
      },
    },
    Error: {
      entry: log('chefBot machine error'),
      type: 'final',
    },
    Done: {
      type: 'final',
    },
  },
});

export { chefBotMachine };
