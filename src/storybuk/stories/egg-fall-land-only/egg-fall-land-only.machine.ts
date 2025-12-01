import { setup, assign, type ActorRefFrom } from 'xstate';

import { STAGE_PADDING } from '../../story-constants';

import type { Direction, Position } from '../../../types';

/**
 * Falling + Landing Only Demo
 *
 * Focuses on the falling and landing mechanics:
 * - Waiting
 * - Falling (gravity + rotation)
 * - Landed (positions egg on ground)
 * - Done
 *
 * This isolates the physics and landing detection for learning purposes.
 */

const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  gravity: 0.15,
  startY: 100,
  maxVelocity: 8,
  rotationSpeed: 5,
};

export const eggFallLandOnlyMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
      rotationDirection?: Direction['value'];
    };
    output: {
      eggId: string;
    };
    context: {
      eggRef: { current: null };
      id: string;
      position: Position;
      velocity: number;
      rotation: number;
      rotationDirection: Direction['value'];
      canvasWidth: number;
      canvasHeight: number;
      groundY: number;
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<any> }
      | { type: 'Play' }
      | { type: 'Update' };
  },
  actions: {
    setEggRef: assign({
      eggRef: (_, params: React.RefObject<any>) => params,
    }),
    updatePositionAndRotation: assign({
      position: ({ context }) => {
        const newY = context.position.y + context.velocity;
        return {
          x: context.position.x,
          y: newY,
        };
      },
      velocity: ({ context }) => {
        const newVelocity = context.velocity + DEMO_CONFIG.gravity;
        return Math.min(newVelocity, DEMO_CONFIG.maxVelocity);
      },
      rotation: ({ context }) => {
        return (
          context.rotation +
          context.rotationDirection * DEMO_CONFIG.rotationSpeed
        );
      },
    }),
    positionEggOnGround: assign({
      position: ({ context }) => ({
        x: context.position.x,
        y: context.groundY - DEMO_CONFIG.eggHeight / 2,
      }),
      velocity: 0,
      rotation: 0,
    }),
  },
  guards: {
    hasLanded: ({ context }) => {
      return context.position.y + DEMO_CONFIG.eggHeight / 2 >= context.groundY;
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QFEpQLQDECGAbX6AMtgHYToDyJuAngMQDKYALgARhoBKYAZgNoAGALqJQABwD2sAJbNpEkqJAAPRABYAHADoA7AFYAbHoBMegWuMBmPZY0GANCBrq1utWssBGDZ52fjBhpWAL7BjqgYOPhEpORUtFoA6tiy0iRQdAAKuNg0giJIIJIycgpKqgjongICWmoG5p6avgLGbRqOzghexlqeBp5eagCc-t6WaqHhaFh4BMRklNQ0WlG4aRkAqmIQ2Mxg+UrFqWWFFb5aGpoGOlemlsMaV3qdiJY6BlqjeiYaP3qePSTMIgCKzaILOLLVZzDZ0ba7fZ8TwFcRSE6KM6IQG6D7GATeTzDYz1QFqV4IDyffHuWwaR5+AzDYHTSJzGKLeIrSGQOiHQrHUqY0AVPQ6Xr0v5PHxNTQdJxvHS1AwDSwCd5ktQE0IgkgSCBwJRgtYcqG0I7ooXlRBVPTDLQBHRKwyGDSWNovBUIQESwlq25OsUaKagmYmyFLBLJVLpC0leTClQ2zwph03Z1GQLu0wUqz24YFwtFwss0NsiGxSMrNYbOMY62Vao6LQNAmBGzuFOPCnvanDJUPAHi24TEPG9kRrlaHkQOtWrEIYwfPoqvR2R7GR5AntqPQO6qPJlOgKDHRjsMTytTgAiCjAc4TDb8ni01l8xiu-ipxh7Nwd-Z+N0U3VIEDB1YIgA */
  id: 'Egg - Falling + Landing',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    return {
      eggRef: { current: null },
      id: input.id,
      position: input.startPosition,
      velocity: 0,
      rotation: 0,
      rotationDirection: input.rotationDirection ?? 1,
      canvasWidth,
      canvasHeight,
      groundY,
    };
  },
  output: ({ context }) => ({
    eggId: context.id,
  }),
  on: {
    'Set eggRef': {
      actions: {
        type: 'setEggRef',
        params: ({ event }) => event.eggRef,
      },
    },
  },
  initial: 'Waiting',
  states: {
    Waiting: {
      on: {
        Play: 'Falling',
      },
    },
    Falling: {
      on: {
        Update: [
          {
            guard: 'hasLanded',
            target: 'Landed',
          },
          {
            actions: 'updatePositionAndRotation',
          },
        ],
      },
    },
    Landed: {
      entry: 'positionEggOnGround',
      always: {
        target: 'Done',
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export type EggFallLandOnlyActorRef = ActorRefFrom<
  typeof eggFallLandOnlyMachine
>;
