import Konva from 'konva';
import { assign, sendParent, setup } from 'xstate';

import { tweenActor, type TweenConfig } from '../../../tweenActor';
import { isImageRef } from '../../../types';

import type { EggColor } from '../../../Egg/egg.machine';
import type { Position } from '../../../types';

/**
 * Falling Egg Machine - With Position Notifications
 *
 * A falling, rotating egg that notifies its parent of position updates
 * for collision detection. Demonstrates:
 * - sendParent() for position updates
 * - Tween-based animation with onUpdate callback
 * - Responding to Catch events from parent
 */

const DEMO_CONFIG = {
  eggWidth: 30,
  eggHeight: 30,
  fallingDuration: 2, // Duration in seconds for the fall
};

export const eggMachine = setup({
  types: {} as {
    input: {
      id: string;
      position: Position;
      canvasHeight: number;
      rotationDirection?: 1 | -1;
      color: EggColor;
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
      currentTweenDurationMS: number;
      color: EggColor;
      resultStatus: 'Caught' | 'Offscreen';
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> }
      | { type: 'Notify of animation position'; position: Position }
      | { type: 'Catch' };
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
        y: context.canvasHeight + DEMO_CONFIG.eggHeight,
      }),
      currentTweenDurationMS: () => DEMO_CONFIG.fallingDuration * 1000,
    }),
    updatePositionFromAnimation: assign({
      position: (_, params: Position) => params,
    }),
    notifyParentOfPosition: sendParent(({ context }) => ({
      type: 'Egg position updated',
      eggId: context.id,
      position: context.position,
      eggColor: context.color,
    })),
    setFinalPosition: assign({
      position: (_, params: Position) => params,
    }),
    setCaughtStatus: assign({
      resultStatus: 'Caught' as const,
    }),
    setOffscreenStatus: assign({
      resultStatus: 'Offscreen' as const,
    }),
  },
  guards: {
    isOffScreen: ({ context }) => {
      return context.position.y > context.canvasHeight + DEMO_CONFIG.eggHeight;
    },
  },
}).createMachine({
  id: 'Egg - Falling (caught)',
  context: ({ input }) => {
    return {
      eggRef: { current: null },
      id: input.id,
      position: input.position,
      targetPosition: input.position,
      canvasHeight: input.canvasHeight,
      currentTweenDurationMS: 0,
      color: input.color,
      resultStatus: 'Offscreen' as const,
    };
  },
  output: ({ context }) => ({
    eggId: context.id,
  }),
  // Egg starts in Idle, transitions to Falling once eggRef is set
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        'Set eggRef': {
          target: 'Falling',
          actions: {
            type: 'setEggRef',
            params: ({ event }) => event.eggRef,
          },
        },
      },
    },
    Falling: {
      entry: 'setTweenProperties',
      invoke: {
        src: 'fallingTweenActor',
        input: ({ context, self }) => {
          if (!isImageRef(context.eggRef)) {
            throw new Error('Egg ref is not set');
          }

          const config: TweenConfig = {
            durationMS: context.currentTweenDurationMS,
            x: context.targetPosition.x,
            y: context.targetPosition.y,
            rotation: Math.random() > 0.5 ? 720 : -720,
            onUpdate: (position: Position) => {
              // Send position updates during animation for collision detection
              if (self.getSnapshot().status === 'active') {
                self.send({
                  type: 'Notify of animation position',
                  position,
                });
              }
            },
          };

          return {
            node: context.eggRef.current,
            config,
          };
        },
        onDone: {
          target: 'Done',
          actions: [
            {
              type: 'setFinalPosition',
              params: ({ event }) => event.output,
            },
            'setOffscreenStatus',
          ],
        },
      },
      on: {
        'Notify of animation position': [
          {
            guard: 'isOffScreen',
            target: 'Done',
            actions: 'setOffscreenStatus',
          },
          {
            actions: [
              {
                type: 'updatePositionFromAnimation',
                params: ({ event }) => event.position,
              },
              'notifyParentOfPosition',
            ],
          },
        ],
        Catch: {
          target: 'Done',
          actions: 'setCaughtStatus',
        },
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export type EggMachine = typeof eggMachine;
