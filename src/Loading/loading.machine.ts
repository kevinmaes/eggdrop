import { assign, fromPromise, setup, type ActorRefFrom } from 'xstate';

import { sounds } from '../sounds';
import { ASSET_MANIFEST, type GameAssets } from '../types/assets';

export type LoadingStatus = {
  progress: number;
  message: string;
};

const MIN_PHASE_DISPLAY_MS = 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Combines asset loading with minimum display time.
 * Ensures loading phases show for at least MIN_PHASE_DISPLAY_MS even if assets load faster.
 */
const loadWithMinimumDelay = async <T>(
  loader: () => Promise<T>
): Promise<T> => {
  const [result] = await Promise.all([loader(), wait(MIN_PHASE_DISPLAY_MS)]);
  return result;
};

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
      await loadWithMinimumDelay(async () => {
        const { default: FontFaceObserver } = await import(
          /* webpackChunkName: "fontfaceobserver" */ 'fontfaceobserver'
        );
        const fontNames = Object.values(ASSET_MANIFEST.fonts);
        await Promise.all(
          fontNames.map((fontName) => new FontFaceObserver(fontName).load())
        );
      });
    }),
    loadGraphics: fromPromise<GameAssets>(async () => {
      return loadWithMinimumDelay(async () => {
        const results = await Promise.all(
          Object.entries(ASSET_MANIFEST.sprites).map(async ([key, path]) => {
            const response = await fetch(path);
            const data = await response.json();
            return [key, data] as const;
          })
        );
        return Object.fromEntries(results) as GameAssets;
      });
    }),
    loadAudio: fromPromise(async () => {
      await loadWithMinimumDelay(async () => {
        const entries = Object.values(sounds);

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
      });
    }),
  },
  delays: {
    LOADED_DELAY: 1_000,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBsD2BDCBLAdlAsugMYAWuYAdADIbZ4AEAYqjgC6wDEELluAbqgDWlNJlwFiZHJRpiGzNrAT9URdKywsA2gAYAurr2JQAB1SwsGlsZAAPRACYArAEYKOgCw6AHDpcOANg8nIKcnABoQAE9HBwcKFwB2AE4PAGYggJdvJ28ggF98yNE6CVJyalpxJhZ2DjAAJwbUBooTZHUAMxaAWwoS8UJy6Uq5KBrFZRwBNSscQ0MbMws5m3sEZzdPHz9A4NCI6MR0gPdnJ2SXLwCnDw9kwuKqvCGpGWfxgHEG9BMyIk43BGKmE-Q+rwqslK9G+v3+ShUs00830iyQIGWlmRa0QATSbmSIQuyUJflcyUiMQ2DkSFFuLicOlyiUSDg8iTxjxAAxekkhHxhPz+WAB9SaLTaHVY3QafR5ZTeo2hsOFAKmM3UyIW+iW5ix1nR6zxBKJJNJDJcFKOCG8bmy2TCLh0e3ZXPlEJGUOqAEEAK7YVBcHgUEEicF8z0Cv0B9WqTXaVE69GY1aGxBOtI6BIpBxpEm2p0BbyUxweU46G7pML3FxpJwON3h4bvMb0aOaMXNVrtLq9MFjD0t6Ht1CxpEJgxJ0x61OgdYZrNJZK5-MuQvF62W5IUXzJRIMzbsjzeRKNgcRoeQDi2WCsdSUdCdViNAAUVAA8t6ACIAUS-AH1fyob0AE0AEoOHdC8lUgNFpxWbE0wQWsnDSOk0gcNcPEtC4MLSEsNltChEnxXI0i8ci2WSAJCiKEAcFQCA4BsKDm11BCDTnRAAFoAgI3j3B0IThJEoSrjPUpByVaoFHYdj9RwHEEA8BwCLSFI6ScFkMLyRJvCoiTBmgr0GBVeF5NnOxjktOkcNIzMGW8DICIcCtiLzFJyQcW1EjuQzeWbaSGBHCzEK4m1MISNJvHSE8XErOIXOcChAnUtk8nZTxkm8fyFX5TBIFCzirOQuJaQCEj9Ow2tQg8FzfASBkUlZHRVxyXKpK-HgisUpCGS8ChLhpY9M1cvFVOtGlvB3CrkkzfcHD3VIOugxh0CwZBfQaMAeqU-wrh3K4AgCS5Uj0+KCMtU5UgCCtnCyZ1ltooA */
  id: 'loadingMachine',
  context: {
    status: {
      progress: 0,
      message: 'Initializing...',
    },
    gameAssets: null,
    audioLoaded: false,
  },
  output: ({ context }) => {
    if (!context.gameAssets) {
      throw new Error('Cannot complete loading: game assets not loaded');
    }
    return {
      status: context.status,
      gameAssets: context.gameAssets,
      audioLoaded: context.audioLoaded,
    };
  },
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
