import { assign, fromPromise, setup } from 'xstate';

import { createDemoActor } from './ActorFactory';
import { getStoryConfigs } from './story-configs';
import { STORY_CANVAS, getCanvasDimensionsForLayout } from './story-constants';
import {
  closeAndReopenInspector,
  closeInspectorIfOpen,
} from './utils/shared-inspector';

import type { LayoutMode } from './story-constants';
import type { StoryActorInstance } from './types';

/**
 * Storybuk State Machine
 *
 * Manages the Storybuk UI state including:
 * - Story selection and loading
 * - Canvas dimension changes
 * - Actor lifecycle (loading, cleanup)
 * - Playback controls (play/pause/reset)
 *
 * State Naming Conventions:
 * - States: Title Case
 * - Events: Sentence case
 * - Actions: camelCase
 * - Guards: lowercase with spaces
 */

/**
 * Actor that loads story actors asynchronously
 */
const loadDemoActorsActor = fromPromise(
  async ({
    input,
  }: {
    input: {
      demoConfig: StoryConfig;
      inspectorEnabled: boolean;
      canvasWidth: number;
      canvasHeight: number;
    };
  }): Promise<StoryActorInstance[]> => {
    // Filter out headless actors if inspector is disabled
    const actorsToLoad = input.inspectorEnabled
      ? input.demoConfig.actors
      : input.demoConfig.actors.filter(
          (config) => !config.componentVersion.includes('headless')
        );

    const instances = await Promise.all(
      actorsToLoad.map((actorConfig) =>
        createDemoActor(actorConfig, input.canvasWidth, input.canvasHeight)
      )
    );
    return instances;
  }
);

export const storybukMachine = setup({
  types: {
    context: {} as {
      selectedStoryId: string | null;
      layoutMode: LayoutMode | null;
      canvasWidth: number;
      canvasHeight: number;
      actorInstances: StoryActorInstance[];
      isPlaying: boolean;
      error: string | null;
      resetCount: number;
      inspectorEnabled: boolean;
    },
    events: {} as
      | { type: 'Select story'; demoId: string }
      | { type: 'Change canvas width'; width: number }
      | { type: 'Play' }
      | { type: 'Reset' }
      | { type: 'Toggle inspector' },
  },
  actors: {
    loadDemoActors: loadDemoActorsActor,
  },
  guards: {
    'has story selected': ({ context }) => context.selectedStoryId !== null,
    'demo config exists': ({ context, event }) => {
      // Check if the event contains a demoId to validate
      const demoId = 'demoId' in event ? event.demoId : context.selectedStoryId;
      if (!demoId) return false;
      const storyConfigs = getStoryConfigs(
        context.canvasWidth,
        context.canvasHeight
      );
      return !!storyConfigs[demoId];
    },
    'inspector enabled': ({ context }) => context.inspectorEnabled,
  },
  actions: {
    setSelectedDemoId: assign({
      selectedStoryId: (_, params: string) => params,
    }),
    setLayoutModeAndDimensions: assign(({ context, event }) => {
      const demoId = 'demoId' in event ? event.demoId : context.selectedStoryId;
      if (!demoId) return {};

      const storyConfigs = getStoryConfigs(
        context.canvasWidth,
        context.canvasHeight
      );
      const demoConfig = storyConfigs[demoId];
      if (!demoConfig) return {};

      const layoutMode = demoConfig.layoutMode || null;

      // Check story config for explicit dimensions first
      if (demoConfig.canvasWidth && demoConfig.canvasHeight) {
        return {
          layoutMode,
          canvasWidth: demoConfig.canvasWidth,
          canvasHeight: demoConfig.canvasHeight,
        };
      }

      // Fall back to layout mode dimensions
      if (!layoutMode) return { layoutMode };

      const dimensions = getCanvasDimensionsForLayout(layoutMode);
      return {
        layoutMode,
        canvasWidth: dimensions.width,
        canvasHeight: dimensions.height,
      };
    }),
    setCanvasWidth: assign({
      canvasWidth: (_, params: number) => params,
    }),
    setActorInstances: assign({
      actorInstances: (_, params: StoryActorInstance[]) => params,
    }),
    clearActorInstances: assign({
      actorInstances: [],
    }),
    setPlaying: assign({
      isPlaying: true,
    }),
    setError: assign({
      error: (_, params: string) => params,
    }),
    clearError: assign({
      error: null,
    }),
    resetPlaybackState: assign(({ context }) => ({
      isPlaying: false,
      resetCount: context.resetCount + 1,
    })),
    cleanupActors: ({ context }) => {
      // Stop all running actors (only if they exist)
      context.actorInstances.forEach((instance) => {
        if (instance.actor) {
          instance.actor.stop();
        }
      });
    },
    reopenInspector: () => {
      // Close old inspector window and create new instance
      // This ensures the inspector shows the new demo's actor
      closeAndReopenInspector();
    },
    toggleInspector: assign({
      inspectorEnabled: ({ context }) => !context.inspectorEnabled,
    }),
    closeInspector: () => {
      closeInspectorIfOpen();
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBEwFsD2BlALgVwgEsMA6ASQgBswBiLMagYxwAIJ0MBtABgF1FQABwyxCOYgDsBIAB6IAzAE55JACyqAHN0WrlARk3cNAGhABPRAFoDGkgFZ5WxQDY7G+QCZFdvQF9fpqiYuATEJAAyGACGRBJQLACCzBgATrA0EBgSYCSEEgBuGADWOUHY+ESkkTF58Uk4qbAIeYWMUeJZPLxd0sKiHVJIsoh62rbKqh4eehrOGqp2iqYWCNYatgDsCxpemnoeG87yzv6BHCGVEdGxdclpNGApKakkgpTtAGapaCRlF2HVG6JO5NFoYNoDLo9IZ9MSSaRyBAbTwkZyqbgLIxzDaKabLKwqHSLDR2bjTVRHDyzE4BEB-CphMosAAK7zMtToDDAzDYHGhQhEcKyCJGWJIG20Gw8zm4yKc+NWMxIyg2oxx8lUeg13g2pzp5wZpCZrKi7LiNAAwgALKJxMAsNoFKKwFgAd0IEBwVv5IFhAxFCFGaJIekW8jsbgj3G4+wVlnkWpI2kUWnkOO0bg8evpoSNHBZbI5zKieFgYB9fvhQ0RNg8JC0XlVqvmeiOCqlIcWEc1WsU3GcLmzBtzv3zJrNUBoACU4GAcBXBf7q4gtLYEw5NRGbBs4+iNuKPNxiaTW9p+0PgobR5gWSWyxAaOOF-0q6Aawc61K5lpDqoE0tzBGHFOymFw3G0XQ0QvcoR2NO9IGnWd5z4XpF1fYYEFUEMpSmPRFDw3QU3keQFQOewPApWVkUmbYs1pHNLjg0sEPoJhWHYTBnyFQY30QHw7FRHY7AOOxNDTACVjwutFC2fDHD0KViPmaD-jzG9i2Yh9rVtGAHVtfJnTdD0vS4pdeIQaVFE7UZcS1HZnFGOwFTcethIo4kNg0FM-Ho4dLgAUSeVJOTY3lOJQmE0OFZcEC0LC9CkxyEujFMFQUqzQ1A1wnEg3VfMvEdAueFJELLZD+Eil9ovMrU9GVDQNhxCN5G0Y5VB3QCEBautHFlLzW3UGzVH8WkJAwdh4CGBjiFQqqeIwyw-3rA5GtXI9owU3dvCTP8HDGaUyQ0FSrwoahZu4gN9hUDwWqOBxHDsOZWzjAwrMesl9mmLxRIjY6R0BWpgQaNJzrMjDDnGSlHAHdEGpejYBIjSlnA8Hx+wOeQ-sYsdCziUH0JrdqsIOP8WuI0MExe6UQwWHxD1WhMDCxxkx3giB8eqjC3CwhGKZxAdwxjBUlG4VE7Eagxv3EvKzgKgKgpSDn5sRHYMuOGMNVE2Y9GF-tUQSlMZVEqllBG3wgA */
  id: 'Storybuk',
  context: {
    selectedStoryId: null,
    layoutMode: null,
    canvasWidth: STORY_CANVAS.width,
    canvasHeight: STORY_CANVAS.height,
    actorInstances: [],
    isPlaying: false,
    error: null,
    resetCount: 0,
    inspectorEnabled: false,
  },
  initial: 'Idle',
  states: {
    Idle: {
      entry: 'clearError',
      on: {
        'Select story': {
          guard: 'demo config exists',
          target: 'Loading Actors',
          actions: [
            {
              type: 'setSelectedDemoId',
              params: ({ event }) => event.demoId,
            },
            'setLayoutModeAndDimensions',
          ],
        },
      },
    },
    'Loading Actors': {
      entry: ['clearError', 'clearActorInstances'],
      invoke: {
        src: 'loadDemoActors',
        input: ({ context }) => {
          const storyConfigs = getStoryConfigs(
            context.canvasWidth,
            context.canvasHeight
          );
          if (!context.selectedStoryId) {
            throw new Error('No story selected');
          }
          const demoConfig = storyConfigs[context.selectedStoryId];
          if (!demoConfig) {
            throw new Error(`Demo config not found: ${context.selectedStoryId}`);
          }
          return {
            demoConfig,
            inspectorEnabled: context.inspectorEnabled,
            canvasWidth: context.canvasWidth,
            canvasHeight: context.canvasHeight,
          };
        },
        onDone: {
          target: 'Demo Ready',
          actions: [
            {
              type: 'setActorInstances',
              params: ({ event }) => event.output,
            },
          ],
        },
        onError: {
          target: 'Error',
          actions: {
            type: 'setError',
            params: ({ event }) =>
              event.error instanceof Error
                ? event.error.message
                : 'Failed to load demo',
          },
        },
      },
    },
    'Demo Ready': {
      on: {
        Play: {
          target: 'Demo Playing',
          actions: 'setPlaying',
        },
        'Select story': [
          {
            guard: { type: 'demo config exists', params: undefined },
            target: 'Loading Actors',
            actions: [
              ({ context }) => {
                if (context.inspectorEnabled) {
                  closeAndReopenInspector();
                }
              },
              'cleanupActors',
              'resetPlaybackState',
              {
                type: 'setSelectedDemoId',
                params: ({ event }) => event.demoId,
              },
              'setLayoutModeAndDimensions',
            ],
          },
        ],
        'Change canvas width': {
          guard: 'has story selected',
          target: 'Loading Actors',
          actions: [
            'cleanupActors',
            {
              type: 'setCanvasWidth',
              params: ({ event }) => event.width,
            },
          ],
        },
        Reset: {
          guard: 'has story selected',
          target: 'Loading Actors',
          actions: [
            ({ context }) => {
              if (context.inspectorEnabled) {
                closeAndReopenInspector();
              }
            },
            'cleanupActors',
            'resetPlaybackState',
          ],
        },
        'Toggle inspector': {
          guard: 'has story selected',
          target: 'Loading Actors',
          actions: [
            'toggleInspector',
            ({ context }) => {
              // Close inspector if we're turning it off (before toggle was applied)
              if (context.inspectorEnabled) {
                closeInspectorIfOpen();
              }
            },
            'cleanupActors',
            'resetPlaybackState',
          ],
        },
      },
    },
    'Demo Playing': {
      on: {
        'Select story': {
          guard: 'demo config exists',
          target: 'Loading Actors',
          actions: [
            ({ context }) => {
              if (context.inspectorEnabled) {
                closeAndReopenInspector();
              }
            },
            'cleanupActors',
            'resetPlaybackState',
            {
              type: 'setSelectedDemoId',
              params: ({ event }) => event.demoId,
            },
            'setLayoutModeAndDimensions',
          ],
        },
        'Change canvas width': {
          guard: 'has story selected',
          target: 'Loading Actors',
          actions: [
            'cleanupActors',
            {
              type: 'setCanvasWidth',
              params: ({ event }) => event.width,
            },
          ],
        },
        Reset: {
          guard: 'has story selected',
          target: 'Loading Actors',
          actions: [
            ({ context }) => {
              if (context.inspectorEnabled) {
                closeAndReopenInspector();
              }
            },
            'cleanupActors',
            'resetPlaybackState',
          ],
        },
        'Toggle inspector': {
          guard: 'has story selected',
          target: 'Loading Actors',
          actions: [
            'toggleInspector',
            ({ context }) => {
              if (context.inspectorEnabled) {
                closeInspectorIfOpen();
              }
            },
            'cleanupActors',
            'resetPlaybackState',
          ],
        },
      },
    },
    Error: {
      on: {
        'Select story': {
          guard: 'demo config exists',
          target: 'Loading Actors',
          actions: [
            {
              type: 'setSelectedDemoId',
              params: ({ event }) => event.demoId,
            },
            'setLayoutModeAndDimensions',
          ],
        },
        Reset: {
          target: 'Idle',
          actions: 'clearError',
        },
      },
    },
  },
});
