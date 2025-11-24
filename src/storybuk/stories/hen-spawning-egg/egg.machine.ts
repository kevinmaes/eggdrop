import Konva from 'konva';
import { assign, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Story Egg Machine - Spawned Actor
 *
 * A falling egg that is dynamically spawned by the parent orchestrator
 * when it receives a "Lay an egg" event from the hen.
 *
 * This demonstrates:
 * - Actor lifecycle (spawned → active → done)
 * - Output on completion (returns eggId for parent cleanup)
 * - Independent state management per spawned actor
 */

const DEMO_CONFIG = {
  eggWidth: 30,
  eggHeight: 30,
  gravity: 0.3,
  maxVelocity: 10,
  rotationSpeed: 3,
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
      groundY: number;
      color: 'white' | 'gold' | 'black';
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> }
      | { type: 'Update' };
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
  },
  guards: {
    isOffScreen: ({ context }) => {
      return context.position.y > context.canvasHeight + DEMO_CONFIG.eggHeight;
    },
  },
}).createMachine({
  id: 'Story-Egg',
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
      groundY: input.canvasHeight, // Not used, but kept for type compatibility
      color: input.color,
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
  // Egg starts falling immediately when spawned and continues until off-screen
  initial: 'Falling',
  states: {
    Falling: {
      on: {
        Update: [
          {
            guard: 'isOffScreen',
            target: 'Done',
          },
          {
            actions: 'updatePositionAndRotation',
          },
        ],
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export type EggActor = typeof eggMachine;
