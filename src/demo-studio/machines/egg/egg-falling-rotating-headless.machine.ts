import { assign, setup } from 'xstate';

import type { Direction, Position } from '../../../types';

/**
 * Headless Egg Falling with Rotation Machine
 *
 * This is a version of egg-falling-rotating.machine.ts with all Konva and React dependencies removed.
 * It maintains the same state structure and logic but uses pure data for position and rotation updates.
 *
 * Purpose: Enable Stately Inspector integration without serialization issues.
 *
 * Features:
 * - Gravity acceleration (velocity increases over time)
 * - Continuous rotation while falling
 * - Continuous falling motion using RAF loop
 * - Falls straight down (no horizontal movement)
 *
 * Physics:
 * - Gravity: 0.15 pixels/frame^2
 * - Initial velocity: 0
 * - Terminal velocity: 8 pixels/frame
 * - Rotation speed: 5 degrees per frame
 */

// Configuration using shared constants
const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  gravity: 0.15, // Acceleration in pixels per frame
  startY: 100, // Starting Y position (where hen would be)
  maxVelocity: 8, // Terminal velocity to prevent falling too fast
  rotationSpeed: 5, // Degrees per frame
};

const eggFallingRotatingHeadlessMachine = setup({
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
      id: string;
      position: Position;
      velocity: number;
      rotation: number;
      rotationDirection: Direction['value'];
      canvasHeight: number;
    };
    events: { type: 'Start' } | { type: 'Update' };
  },
  actions: {
    updatePositionAndRotation: assign({
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
      rotation: ({ context }) => {
        // Rotate the egg continuously
        return (
          context.rotation +
          context.rotationDirection * DEMO_CONFIG.rotationSpeed
        );
      },
    }),
  },
}).createMachine({
  id: 'Egg-Falling-Rotating-Headless',
  context: ({ input }) => {
    // Position egg centered in the demo canvas
    // Demo canvas is 384px wide (20% of 1920px)
    // Since we use offsetX/offsetY for rotation, position.x IS the center point
    const canvasWidth = input.canvasWidth ?? 1920;
    const eggCenterX = Math.floor(canvasWidth / 2);

    return {
      id: input.id,
      position: input.startPosition || {
        x: eggCenterX,
        y: DEMO_CONFIG.startY,
      },
      velocity: 0, // Start with zero velocity
      rotation: 0, // Start with zero rotation
      rotationDirection: input.rotationDirection ?? 1, // Default clockwise
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
        Update: {
          actions: 'updatePositionAndRotation',
        },
      },
    },
  },
});

export default eggFallingRotatingHeadlessMachine;
