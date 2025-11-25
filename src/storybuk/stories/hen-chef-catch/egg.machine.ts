import Konva from 'konva';
import { assign, sendParent, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Falling Egg Machine - With Position Notifications
 *
 * A falling, rotating egg that notifies its parent of position updates
 * for collision detection. Demonstrates:
 * - sendParent() for position updates
 * - Gravity and rotation physics
 * - Responding to Catch events from parent
 */

const DEMO_CONFIG = {
  eggWidth: 30,
  eggHeight: 30,
  gravity: 0.5,
  maxVelocity: 12,
  rotationSpeed: 5,
};

export const eggMachine = setup({
  types: {} as {
    input: {
      id: string;
      position: Position;
      canvasHeight: number;
      rotationDirection?: 1 | -1;
      color: 'white' | 'gold' | 'black';
    };
    output: {
      eggId: string;
    };
    context: {
      eggRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      velocity: number;
      rotation: number;
      rotationDirection: 1 | -1;
      canvasHeight: number;
      color: 'white' | 'gold' | 'black';
      resultStatus: 'Caught' | 'Offscreen';
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> }
      | { type: 'Update' }
      | { type: 'Catch' };
  },
  actions: {
    setEggRef: assign({
      eggRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    updatePositionAndRotation: assign(({ context }) => {
      const newVelocity = Math.min(
        context.velocity + DEMO_CONFIG.gravity,
        DEMO_CONFIG.maxVelocity
      );
      const newY = context.position.y + newVelocity;
      const newRotation =
        context.rotation +
        context.rotationDirection * DEMO_CONFIG.rotationSpeed;

      return {
        position: { x: context.position.x, y: newY },
        velocity: newVelocity,
        rotation: newRotation,
      };
    }),
    notifyParentOfPosition: sendParent(({ context }) => ({
      type: 'Egg position updated',
      eggId: context.id,
      position: context.position,
      eggColor: context.color,
    })),
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
  id: 'Egg-Falling',
  context: ({ input }) => {
    return {
      eggRef: { current: null },
      id: input.id,
      position: input.position,
      velocity: 0,
      rotation: 0,
      rotationDirection:
        input.rotationDirection ?? (Math.random() < 0.5 ? -1 : 1),
      canvasHeight: input.canvasHeight,
      color: input.color,
      resultStatus: 'Offscreen' as const,
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
  initial: 'Idle',
  states: {
    Idle: {
      always: {
        guard: ({ context }) => context.eggRef.current !== null,
        target: 'Falling',
      },
    },
    Falling: {
      on: {
        Update: [
          {
            guard: 'isOffScreen',
            target: 'Done',
            actions: 'setOffscreenStatus',
          },
          {
            actions: ['updatePositionAndRotation', 'notifyParentOfPosition'],
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
