import Konva from 'konva';
import { setup, assign, type ActorRefFrom } from 'xstate';

import { tweenActor, type TweenConfig } from '../../../tweenActor';
import { isImageRef } from '../../../types';
import { STAGE_PADDING } from '../../story-constants';

import type { Direction, Position } from '../../../types';

/**
 * Falling + Landing Only Demo - Using Tween Actor Pattern
 *
 * Focuses on the falling and landing mechanics using the same pattern as the real game:
 * - Waiting
 * - Falling (tween-based animation with rotation)
 * - Landed (positions egg on ground)
 * - Done
 *
 * This demonstrates the tween actor pattern for straight-down falling.
 */

const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  fallingDuration: 3, // Duration in seconds for the fall
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
      eggRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      targetPosition: Position;
      canvasHeight: number;
      groundY: number;
      currentTweenDurationMS: number;
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> }
      | { type: 'Play' };
  },
  actors: {
    fallingTweenActor: tweenActor,
  },
  actions: {
    setEggRef: assign(({ context }, params: React.RefObject<Konva.Image>) => {
      // Set the node position immediately when ref is attached
      if (isImageRef(params)) {
        params.current.setPosition(context.position);
      }
      return { eggRef: params };
    }),
    setTweenProperties: assign({
      targetPosition: ({ context }) => ({
        x: context.position.x,
        y: context.groundY - DEMO_CONFIG.eggHeight / 2,
      }),
      currentTweenDurationMS: () => DEMO_CONFIG.fallingDuration * 1000,
    }),
    setFinalPosition: assign({
      position: (_, params: Position) => params,
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QFEpQLQDECGAbX6AMtgHYToDyJuAngMQDKYALgARhoBKYAZgNoAGALqJQABwD2sAJbNpEkqJAAPRABYAHADoA7AFYAbHoBMegWuMBmPZY0GANCBrq1utWssBGDZ52fjBhpWAL7BjqgYOPhEpORUtFoA6tiy0iRQdAAKuNg0giJIIJIycgpKqgjongICWmoG5p6avgLGbRqOzghexlqeBp5eagCc-t6WaqHhaFh4BMRklNQ0WlG4aRkAqmIQ2Mxg+UrFqWWFFb5aGpoGOlemlsMaV3qdiJY6BlqjeiYaP3qePSTMIgCKzaILOLLVZzDZ0ba7fZ8TwFcRSE6KM6IQG6D7GATeTzDYz1QFqV4IDyffHuWwaR5+AzDYHTSJzGKLeIrSGQOiHQrHUqY0AVPQ6Xr0v5PHxNTQdJxvHS1AwDSwCd5ktQE0IgkgSCBwJRgtYcqG0I7ooXlRBVPTDLQBHRKwyGDSWNovBUIQESwlq25OsUaKagmYmyFLBLJVLpC0leTClQ2zwph03Z1GQLu0wUqz24YFwtFwss0NsiGxSMrNYbOMY62Vao6LQNAmBGzuFOPCnvanDJUPAHi24TEPG9kRrlaHkQOtWrEIYwfPoqvR2R7GR5AntqPQO6qPJlOgKDHRjsMTytTgAiCjAc4TDb8ni01l8xiu-ipxh7Nwd-Z+N0U3VIEDB1YIgA */
  id: 'Egg - Falling + Landing',
  context: ({ input }) => {
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    return {
      eggRef: { current: null },
      id: input.id,
      position: input.startPosition,
      targetPosition: input.startPosition,
      canvasHeight,
      groundY,
      currentTweenDurationMS: 0,
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
      entry: 'setTweenProperties',
      invoke: {
        src: 'fallingTweenActor',
        input: ({ context }) => {
          if (!isImageRef(context.eggRef)) {
            throw new Error('Egg ref is not set');
          }

          const config: TweenConfig = {
            durationMS: context.currentTweenDurationMS,
            x: context.targetPosition.x,
            y: context.targetPosition.y,
            rotation: Math.random() > 0.5 ? 720 : -720,
          };

          return {
            node: context.eggRef.current,
            config,
          };
        },
        onDone: {
          target: 'Landed',
          actions: {
            type: 'setFinalPosition',
            params: ({ event }) => event.output,
          },
        },
      },
    },
    Landed: {
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
