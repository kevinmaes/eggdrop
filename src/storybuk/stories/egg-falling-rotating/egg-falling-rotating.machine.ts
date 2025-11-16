import Konva from 'konva';
import { assign, setup } from 'xstate';

import type { Direction, Position } from '../../../types';

/**
 * Egg Falling with Rotation Machine
 *
 * Demonstrates a falling egg with gravity acceleration AND rotation.
 * The egg starts at the top and falls straight down while rotating,
 * just like in the actual game.
 *
 * Features:
 * - Gravity acceleration (velocity increases over time)
 * - Continuous rotation while falling
 * - Continuous falling motion using RAF loop
 * - Falls straight down (no horizontal movement)
 * - Positioned on left 20% of screen
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

const eggFallingRotatingMachine = setup({
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
      velocity: number;
      rotation: number;
      rotationDirection: Direction['value'];
      canvasHeight: number;
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> }
      | { type: 'Update' }
      | { type: 'Start' };
  },
  actions: {
    setEggRef: assign({
      eggRef: (_, params: React.RefObject<Konva.Image>) => params,
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
  id: 'Egg-Falling-Rotating',
  context: ({ input }) => {
    // Position egg centered in the story canvas
    // Story canvas is 384px wide (20% of 1920px)
    // Since we use offsetX/offsetY for rotation, position.x IS the center point
    const canvasWidth = input.canvasWidth ?? 1920;
    const eggCenterX = Math.floor(canvasWidth / 2);

    return {
      eggRef: { current: null },
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

export default eggFallingRotatingMachine;
