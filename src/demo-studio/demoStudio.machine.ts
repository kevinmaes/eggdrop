import { assign, fromPromise, setup } from 'xstate';

import { createDemoActor } from './ActorFactory';
import { getDemoConfigs } from './demo-configs';
import { DEMO_CANVAS } from './demo-constants';

import type { DemoActorInstance, DemoConfig } from './types';

/**
 * Demo Studio State Machine
 *
 * Manages the Demo Studio UI state including:
 * - Demo selection and loading
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
 * Actor that loads demo actors asynchronously
 */
const loadDemoActorsActor = fromPromise(
  async ({
    input,
  }: {
    input: { demoConfig: DemoConfig };
  }): Promise<DemoActorInstance[]> => {
    const instances = await Promise.all(
      input.demoConfig.actors.map((actorConfig) => createDemoActor(actorConfig))
    );
    return instances;
  }
);

export const demoStudioMachine = setup({
  types: {
    context: {} as {
      selectedDemoId: string | null;
      canvasWidth: number;
      canvasHeight: number;
      actorInstances: DemoActorInstance[];
      isPlaying: boolean;
      error: string | null;
    },
    events: {} as
      | { type: 'Select demo'; demoId: string }
      | { type: 'Change canvas width'; width: number }
      | { type: 'Play' }
      | { type: 'Pause' }
      | { type: 'Reset' },
  },
  actors: {
    loadDemoActors: loadDemoActorsActor,
  },
  guards: {
    'has demo selected': ({ context }) => context.selectedDemoId !== null,
    'demo config exists': ({ context, event }) => {
      // Check if the event contains a demoId to validate
      const demoId = 'demoId' in event ? event.demoId : context.selectedDemoId;
      if (!demoId) return false;
      const demoConfigs = getDemoConfigs(
        context.canvasWidth,
        context.canvasHeight
      );
      return !!demoConfigs[demoId];
    },
  },
  actions: {
    setSelectedDemoId: assign({
      selectedDemoId: (_, params: string) => params,
    }),
    setCanvasWidth: assign({
      canvasWidth: (_, params: number) => params,
    }),
    setActorInstances: assign({
      actorInstances: (_, params: DemoActorInstance[]) => params,
    }),
    clearActorInstances: assign({
      actorInstances: [],
    }),
    setPlaying: assign({
      isPlaying: true,
    }),
    setPaused: assign({
      isPlaying: false,
    }),
    setError: assign({
      error: (_, params: string) => params,
    }),
    clearError: assign({
      error: null,
    }),
    resetDemo: assign({
      selectedDemoId: null,
      actorInstances: [],
      isPlaying: true,
      error: null,
    }),
    cleanupActors: ({ context }) => {
      // Stop all running actors
      context.actorInstances.forEach((instance) => {
        instance.actor.stop();
      });
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBEwFsD2BlALgVwgEsMA6ASQgBswBiLMagYxwAIJ0MBtABgF1FQABwyxCOYgDsBIAB6IAzAE55JACyqAHN0WrlARk3cNAGhABPRAFoDGkgFZ5WxQDY7G+QCZFdvQF9fpqiYuATEJAAyGACGRBJQLACCzBgATrA0EBgSYCSEEgBuGADWOUHY+ESkkTF58Uk4qbAIeYWMUeJZPLxd0sKiHVJIsoh62rbKqh4eehrOGqp2iqYWCNYatgDsCxpemnoeG87yzv6BHCGVEdGxdclpNGApKakkgpTtAGapaCRlF2HVG6JO5NFoYNoDLo9IZ9MSSaRyBAbTwkZyqbgLIxzDaKabLKwqHSLDR2bjTVRHDyzE4BEB-CphMosAAK7zMtToDDAzDYHGhQhEcKyCJGWJIG20Gw8zm4yKc+NWMxIyg2oxx8lUeg13g2pzp5wZpCZrKi7LiNAAwgALKJxMAsNoFKKwFgAd0IEBwVv5IFhAxFCFGaJIekW8jsbgj3G4+wVlnkWpI2kUWnkOO0bg8evpoSNHBZbI5zKieFgYB9fvhQ0RNg8JC0XlVqvmeiOCqlIcWEc1WsU3GcLmzBtzv3zJrNUBoACU4GAcBXBf7q4gtLYEw5NRGbBs4+iNuKPNxiaTW9p+0PgobR5gWSWyxAaOOF-0q6Aawc61K5lpDqoE0tzBGHFOymFw3G0XQ0QvcoR2NO9IGnWd5z4XpF1fYYEFUEMpSmPRFDw3QU3keQFQOewPApWVkUmbYs1pHNLjg0sEPoJhWHYTBnyFQY30QHw7FRHY7AOOxNDTACVjwutFC2fDHD0KViPmaD-jzG9i2Yh9rVtGAHVtfJnTdD0vS4pdeIQaVFE7UZcS1HZnFGOwFTcethIo4kNg0FM-Ho4dLgAUSeVJOTY3lOJQmE0OFZcEC0LC9CkxyEujFMFQUqzQ1A1wnEg3VfMvEdAueFJELLZD+Eil9ovMrU9GVDQNhxCN5G0Y5VB3QCEBautHFlLzW3UGzVH8WkJAwdh4CGBjiFQqqeIwyw-3rA5GtXI9owU3dvCTP8HDGaUyQ0FSrwoahZu4gN9hUDwWqOBxHDsOZWzjAwrMesl9mmLxRIjY6R0BWpgQaNJzrMjDDnGSlHAHdEGpejYBIjSlnA8Hx+wOeQ-sYsdCziUH0JrdqsIOP8WuI0MExe6UQwWHxD1WhMDCxxkx3giB8eqjC3CwhGKZxAdwxjBUlG4VE7Eagxv3EvKzgKgKgpSDn5sRHYMuOGMNVE2Y9GF-tUQSlMZVEqllBG3wgA */
  id: 'DemoStudio',
  context: {
    selectedDemoId: null,
    canvasWidth: DEMO_CANVAS.width,
    canvasHeight: DEMO_CANVAS.height,
    actorInstances: [],
    isPlaying: true,
    error: null,
  },
  initial: 'Idle',
  states: {
    Idle: {
      entry: 'clearError',
      on: {
        'Select demo': {
          guard: 'demo config exists',
          target: 'Loading Actors',
          actions: {
            type: 'setSelectedDemoId',
            params: ({ event }) => event.demoId,
          },
        },
      },
    },
    'Loading Actors': {
      entry: ['clearError', 'clearActorInstances'],
      invoke: {
        src: 'loadDemoActors',
        input: ({ context }) => {
          const demoConfigs = getDemoConfigs(
            context.canvasWidth,
            context.canvasHeight
          );
          if (!context.selectedDemoId) {
            throw new Error('No demo selected');
          }
          const demoConfig = demoConfigs[context.selectedDemoId];
          if (!demoConfig) {
            throw new Error(`Demo config not found: ${context.selectedDemoId}`);
          }
          return { demoConfig };
        },
        onDone: {
          target: 'Demo Playing',
          actions: [
            {
              type: 'setActorInstances',
              params: ({ event }) => event.output,
            },
            'setPlaying',
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
    'Demo Playing': {
      on: {
        'Select demo': {
          guard: 'demo config exists',
          target: 'Loading Actors',
          actions: [
            'cleanupActors',
            {
              type: 'setSelectedDemoId',
              params: ({ event }) => event.demoId,
            },
          ],
        },
        'Change canvas width': {
          guard: 'has demo selected',
          target: 'Loading Actors',
          actions: [
            'cleanupActors',
            {
              type: 'setCanvasWidth',
              params: ({ event }) => event.width,
            },
          ],
        },
        Pause: {
          target: 'Demo Paused',
          actions: 'setPaused',
        },
        Reset: {
          target: 'Idle',
          actions: ['cleanupActors', 'resetDemo'],
        },
      },
    },
    'Demo Paused': {
      on: {
        Play: {
          target: 'Demo Playing',
          actions: 'setPlaying',
        },
        Reset: {
          target: 'Idle',
          actions: ['cleanupActors', 'resetDemo'],
        },
        'Select demo': {
          guard: 'demo config exists',
          target: 'Loading Actors',
          actions: [
            'cleanupActors',
            {
              type: 'setSelectedDemoId',
              params: ({ event }) => event.demoId,
            },
          ],
        },
        'Change canvas width': {
          guard: 'has demo selected',
          target: 'Loading Actors',
          actions: [
            'cleanupActors',
            {
              type: 'setCanvasWidth',
              params: ({ event }) => event.width,
            },
          ],
        },
      },
    },
    Error: {
      on: {
        'Select demo': {
          guard: 'demo config exists',
          target: 'Loading Actors',
          actions: {
            type: 'setSelectedDemoId',
            params: ({ event }) => event.demoId,
          },
        },
        Reset: {
          target: 'Idle',
          actions: 'resetDemo',
        },
      },
    },
  },
});
