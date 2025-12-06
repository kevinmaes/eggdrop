import { assign, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Headless Egg Falling Machine - Simple Gravity Physics
 *
 * This is a version of egg-falling.machine.ts with all Konva and React dependencies removed.
 * It maintains the same state structure and logic but uses pure data for position updates
 * instead of Konva refs.
 *
 * Purpose: Enable Stately Inspector integration without serialization issues.
 *
 * Features:
 * - Gravity acceleration (velocity increases over time)
 * - Continuous falling motion using RAF loop
 * - Falls straight down (no horizontal movement)
 * - Positioned on left 20% of screen
 *
 * Physics:
 * - Gravity: 0.15 pixels/frame^2
 * - Initial velocity: 0
 * - Terminal velocity: 8 pixels/frame (max fall speed)
 */

// Configuration using shared constants
const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  gravity: 0.15, // Acceleration in pixels per frame
  startY: 100, // Starting Y position (where hen would be)
  maxVelocity: 8, // Terminal velocity to prevent falling too fast
};

export const eggFallingHeadlessMachine = setup({
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
      id: string;
      position: Position;
      velocity: number;
      canvasHeight: number;
    };
    events: { type: 'Start' } | { type: 'Update' };
  },
  actions: {
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
  guards: {
    isOffScreen: ({ context }) => {
      // Check if entire egg (including top edge) has passed bottom of canvas
      return context.position.y - DEMO_CONFIG.eggHeight > context.canvasHeight;
    },
  },
}).createMachine({
  id: 'Egg-Falling-Headless',
  context: ({ input }) => {
    // Position egg centered in the story canvas
    // Story canvas is 384px wide (20% of 1920px)
    // Center the egg: (canvasWidth / 2) - (egg width / 2)
    const canvasWidth = input.canvasWidth ?? 1920;
    const eggCenterX = Math.floor((canvasWidth - DEMO_CONFIG.eggWidth) / 2);

    return {
      id: input.id,
      position: input.startPosition || {
        x: eggCenterX,
        y: DEMO_CONFIG.startY,
      },
      velocity: 0, // Start with zero velocity
      canvasHeight: input.canvasHeight ?? 1080,
    };
  },
  output: ({ context }) => ({
    eggId: context.id,
  }),
  initial: 'Waiting',
  states: {
    Waiting: {
      // Egg is visible but not falling yet
      // Waits for Play button to be clicked
      on: {
        Start: 'Falling',
      },
    },
    Falling: {
      on: {
        Update: [
          {
            guard: 'isOffScreen',
            target: 'OffScreen',
          },
          {
            actions: 'updatePosition',
          },
        ],
      },
    },
    OffScreen: {
      type: 'final',
    },
  },
});
