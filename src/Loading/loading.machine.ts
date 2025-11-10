import { assign, fromPromise, setup, type ActorRefFrom } from 'xstate';

import { type GameAssets } from '../types/assets';

export type LoadingStatus = {
  progress: number;
  message: string;
};

const MIN_PHASE_DISPLAY_MS = 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const loadingMachine = setup({
  types: {} as {
    context: {
      status: LoadingStatus;
      gameAssets: GameAssets | null;
      audioLoaded: boolean;
    };
    input: {};
    output: {
      gameAssets: GameAssets;
      audioLoaded: boolean;
      status: LoadingStatus;
    };
    emitted: {
      type: 'Loading status';
      status: LoadingStatus;
    };
  },
  actions: {
    updateStatus: assign({
      status: (_, params: LoadingStatus) => params,
    }),
    storeAssets: assign({
      gameAssets: ({ event }) =>
        (event as unknown as { output: GameAssets }).output ?? null,
    }),
    markAudioLoaded: assign({
      audioLoaded: () => true,
    }),
  },
  actors: {
    loadFonts: fromPromise(async () => {
      await Promise.all([
        // Actual loading work
        (async () => {
          const { default: FontFaceObserver } = await import(
            /* webpackChunkName: "fontfaceobserver" */ 'fontfaceobserver'
          );
          const arcoFont = new FontFaceObserver('Arco');
          const jetBrainsMonoFont = new FontFaceObserver('JetBrains Mono');
          await Promise.all([arcoFont.load(), jetBrainsMonoFont.load()]);
        })(),
        // Minimum display time
        wait(MIN_PHASE_DISPLAY_MS),
      ]);
    }),
    loadGraphics: fromPromise<GameAssets>(async () => {
      const [assets] = await Promise.all([
        // Actual loading work
        (async () => {
          const [henResult, eggResult, chickResult, chefResult, uiResult] =
            await Promise.all([
              fetch('images/hen.sprite.json'),
              fetch('images/egg.sprite.json'),
              fetch('images/chick.sprite.json'),
              fetch('images/chef.sprite.json'),
              fetch('images/ui.sprite.json'),
            ]);

          const [hen, egg, chick, chef, ui] = await Promise.all([
            henResult.json(),
            eggResult.json(),
            chickResult.json(),
            chefResult.json(),
            uiResult.json(),
          ]);

          return {
            ui,
            hen,
            egg,
            chick,
            chef,
          };
        })(),
        // Minimum display time
        wait(MIN_PHASE_DISPLAY_MS),
      ]);
      return assets;
    }),
    loadAudio: fromPromise(async () => {
      await Promise.all([
        // Actual loading work
        (async () => {
          const { sounds } = await import('../sounds');
          const entries = Object.values(sounds ?? {});

          await Promise.all(
            entries.map((sound) => {
              if (!sound || typeof sound.load !== 'function') {
                return Promise.resolve();
              }

              return new Promise<void>((resolve, reject) => {
                const handleLoad = () => {
                  cleanup();
                  resolve();
                };
                const handleError = (_id: number, error: unknown) => {
                  cleanup();
                  reject(
                    error instanceof Error
                      ? error
                      : new Error('Failed to load audio asset')
                  );
                };
                const cleanup = () => {
                  if (typeof sound.off === 'function') {
                    sound.off('load', handleLoad);
                    sound.off('loaderror', handleError);
                  }
                };

                if (typeof sound.on === 'function') {
                  sound.on('load', handleLoad);
                  sound.on('loaderror', handleError);
                }

                try {
                  sound.load();
                } catch (error) {
                  cleanup();
                  reject(
                    error instanceof Error
                      ? error
                      : new Error('Failed to trigger audio load')
                  );
                }
              });
            })
          );
        })(),
        // Minimum display time
        wait(MIN_PHASE_DISPLAY_MS),
      ]);
    }),
  },
  delays: {
    LOADED_DELAY: 1_000,
  },
}).createMachine({
  id: 'loadingMachine',
  context: {
    status: {
      progress: 0,
      message: 'Initializing...',
    },
    gameAssets: null,
    audioLoaded: false,
  },
  output: ({ context }) => ({
    status: context.status,
    gameAssets: context.gameAssets as GameAssets,
    audioLoaded: context.audioLoaded,
  }),
  initial: 'Loading Fonts',
  states: {
    'Loading Fonts': {
      entry: {
        type: 'updateStatus',
        params: {
          progress: 0.1,
          message: 'Loading fonts...',
        },
      },
      invoke: {
        src: 'loadFonts',
        onDone: {
          target: 'Loading Graphics',
          actions: {
            type: 'updateStatus',
            params: {
              progress: 0.35,
              message: 'Loading graphics...',
            },
          },
        },
        onError: 'Failure',
      },
    },
    'Loading Graphics': {
      entry: {
        type: 'updateStatus',
        params: {
          progress: 0.35,
          message: 'Loading graphics...',
        },
      },
      invoke: {
        src: 'loadGraphics',
        onDone: {
          target: 'Loading Audio',
          actions: [
            'storeAssets',
            {
              type: 'updateStatus',
              params: {
                progress: 0.65,
                message: 'Loading audio...',
              },
            },
          ],
        },
        onError: 'Failure',
      },
    },
    'Loading Audio': {
      entry: {
        type: 'updateStatus',
        params: {
          progress: 0.65,
          message: 'Loading audio...',
        },
      },
      invoke: {
        src: 'loadAudio',
        onDone: {
          target: 'Loaded',
          actions: [
            'markAudioLoaded',
            {
              type: 'updateStatus',
              params: {
                progress: 1,
                message: 'Ready!',
              },
            },
          ],
        },
        onError: 'Failure',
      },
    },
    Loaded: {
      after: {
        LOADED_DELAY: 'Done',
      },
    },
    Done: {
      type: 'final',
    },
    Failure: {
      type: 'final',
      output: ({ event }) => {
        throw (event as unknown as { error: unknown }).error;
      },
    },
  },
});

export type LoadingActorRef = ActorRefFrom<typeof loadingMachine>;
