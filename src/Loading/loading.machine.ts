import { assign, fromPromise, setup, type ActorRefFrom } from 'xstate';

import { type GameAssets } from '../types/assets';

export type LoadingStatus = {
  progress: number;
  message: string;
};

type GateState = {
  ready: boolean;
  delay: boolean;
};

const createGateState = (): GateState => ({
  ready: false,
  delay: false,
});

export const loadingMachine = setup({
  types: {} as {
    context: {
      status: LoadingStatus;
      gameAssets: GameAssets | null;
      audioLoaded: boolean;
      gates: {
        fonts: GateState;
        graphics: GateState;
        audio: GateState;
      };
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
    ensureMinimumProgress: assign({
      status: ({ context }, params: { minimum: number }) => ({
        progress: Math.max(context.status.progress, params.minimum),
        message: context.status.message,
      }),
    }),
    resetFontsGate: assign({
      gates: ({ context }) => ({
        ...context.gates,
        fonts: createGateState(),
      }),
    }),
    resetGraphicsGate: assign({
      gates: ({ context }) => ({
        ...context.gates,
        graphics: createGateState(),
      }),
    }),
    resetAudioGate: assign({
      gates: ({ context }) => ({
        ...context.gates,
        audio: createGateState(),
      }),
    }),
    markFontsReady: assign({
      gates: ({ context }) => ({
        ...context.gates,
        fonts: { ...context.gates.fonts, ready: true },
      }),
    }),
    markFontsDelay: assign({
      gates: ({ context }) => ({
        ...context.gates,
        fonts: { ...context.gates.fonts, delay: true },
      }),
    }),
    markGraphicsReady: assign({
      gates: ({ context }) => ({
        ...context.gates,
        graphics: { ...context.gates.graphics, ready: true },
      }),
    }),
    markGraphicsDelay: assign({
      gates: ({ context }) => ({
        ...context.gates,
        graphics: { ...context.gates.graphics, delay: true },
      }),
    }),
    markAudioReady: assign({
      gates: ({ context }) => ({
        ...context.gates,
        audio: { ...context.gates.audio, ready: true },
      }),
    }),
    markAudioDelay: assign({
      gates: ({ context }) => ({
        ...context.gates,
        audio: { ...context.gates.audio, delay: true },
      }),
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
      const { default: FontFaceObserver } = await import(
        /* webpackChunkName: "fontfaceobserver" */ 'fontfaceobserver'
      );
      const arcoFont = new FontFaceObserver('Arco');
      const jetBrainsMonoFont = new FontFaceObserver('JetBrains Mono');
      await Promise.all([arcoFont.load(), jetBrainsMonoFont.load()]);
    }),
    loadGraphics: fromPromise<GameAssets>(async () => {
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
    }),
    loadAudio: fromPromise(async () => {
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
    }),
  },
  delays: {
    MIN_PHASE_DURATION: 500,
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
    gates: {
      fonts: createGateState(),
      graphics: createGateState(),
      audio: createGateState(),
    },
  },
  output: ({ context }) => ({
    status: context.status,
    gameAssets: context.gameAssets as GameAssets,
    audioLoaded: context.audioLoaded,
  }),
  initial: 'Loading Fonts',
  states: {
    'Loading Fonts': {
      entry: [
        {
          type: 'resetFontsGate',
        },
        {
          type: 'updateStatus',
          params: {
            progress: 0.1,
            message: 'Loading fonts...',
          },
        },
      ],
      invoke: {
        src: 'loadFonts',
        onDone: {
          actions: {
            type: 'markFontsReady',
          },
        },
        onError: 'Failure',
      },
      after: {
        MIN_PHASE_DURATION: {
          actions: [
            { type: 'markFontsDelay' },
            {
              type: 'ensureMinimumProgress',
              params: { minimum: 0.2 },
            },
          ],
        },
      },
      always: [
        {
          guard: ({ context }) =>
            context.gates.fonts.ready && context.gates.fonts.delay,
          target: 'Loading Graphics',
          actions: [
            {
              type: 'updateStatus',
              params: {
                progress: 0.35,
                message: 'Loading graphics...',
              },
            },
          ],
        },
      ],
    },
    'Loading Graphics': {
      entry: [
        'resetGraphicsGate',
        {
          type: 'updateStatus',
          params: {
            progress: 0.35,
            message: 'Loading graphics...',
          },
        },
      ],
      invoke: {
        src: 'loadGraphics',
        onDone: {
          actions: ['storeAssets', 'markGraphicsReady'],
        },
        onError: 'Failure',
      },
      after: {
        MIN_PHASE_DURATION: {
          actions: [
            { type: 'markGraphicsDelay' },
            {
              type: 'ensureMinimumProgress',
              params: { minimum: 0.55 },
            },
          ],
        },
      },
      always: [
        {
          guard: ({ context }) =>
            context.gates.graphics.ready && context.gates.graphics.delay,
          target: 'Loading Audio',
          actions: [
            {
              type: 'updateStatus',
              params: {
                progress: 0.65,
                message: 'Loading audio...',
              },
            },
          ],
        },
      ],
    },
    'Loading Audio': {
      entry: [
        'resetAudioGate',
        assign({
          status: ({ context }) => ({
            progress: Math.max(context.status.progress, 0.65),
            message: 'Loading audio...',
          }),
        }),
      ],
      invoke: {
        src: 'loadAudio',
        onDone: {
          actions: ['markAudioLoaded', 'markAudioReady'],
        },
        onError: 'Failure',
      },
      after: {
        MIN_PHASE_DURATION: {
          actions: [
            { type: 'markAudioDelay' },
            {
              type: 'ensureMinimumProgress',
              params: { minimum: 0.85 },
            },
          ],
        },
      },
      always: [
        {
          guard: ({ context }) =>
            context.gates.audio.ready && context.gates.audio.delay,
          target: 'Loaded',
          actions: [
            {
              type: 'updateStatus',
              params: {
                progress: 1,
                message: 'Ready!',
              },
            },
          ],
        },
      ],
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
