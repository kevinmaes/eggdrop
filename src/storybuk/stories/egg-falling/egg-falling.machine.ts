import Konva from 'konva';
import { assign, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Egg Falling Machine - Simple Gravity Physics
 *
 * Demonstrates a falling egg with gravity acceleration.
 * The egg starts at the top (roughly where a hen would be)
 * and falls straight down until it exits the bottom of the screen.
 *
 * Features:
 * - Gravity acceleration (velocity increases over time)
 * - Continuous falling motion using RAF loop
 * - Falls straight down (no horizontal movement)
 * - Positioned on left 20% of screen
 *
 * Physics:
 * - Gravity: 0.5 pixels/frame^2
 * - Initial velocity: 0
 * - Terminal velocity: none (keeps accelerating)
 */

// Configuration using shared constants
const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  gravity: 0.15, // Acceleration in pixels per frame (reduced for smoother fall)
  startY: 100, // Starting Y position (where hen would be)
  maxVelocity: 8, // Terminal velocity to prevent falling too fast
};

export const eggFallingMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
    };
    output: {
      eggId: string;
    };
    context: {
      eggRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      velocity: number;
      canvasHeight: number;
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> }
      | { type: 'Update' }
      | { type: 'Play' };
  },
  actions: {
    setEggRef: assign({
      eggRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    updatePosition: assign({
      position: ({ context }) => {
        const newY = context.position.y + context.velocity;
        return {
          x: context.position.x,
          y: newY,
        };
      },
      velocity: ({ context }) => {
        // Apply gravity but cap at max velocity (terminal velocity)
        const newVelocity = context.velocity + DEMO_CONFIG.gravity;
        return Math.min(newVelocity, DEMO_CONFIG.maxVelocity);
      },
    }),
  },
}).createMachine({
  id: 'Egg-Falling',
  context: ({ input }) => {
    return {
      eggRef: { current: null },
      id: input.id,
      position: input.startPosition,
      velocity: 0, // Start with zero velocity
      canvasHeight: input.canvasHeight ?? 1080,
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
      // Egg is visible but not falling yet
      // Waits for Play button to be clicked
      on: {
        Play: 'Falling',
      },
    },
    Falling: {
      on: {
        Update: {
          actions: 'updatePosition',
        },
      },
    },
  },
});
