import { setup, assign, type ActorRefFrom } from 'xstate';

import { STAGE_PADDING } from '../../story-constants';

import type { Direction, Position } from '../../../types';

/**
 * Egg Hatch Machine - Complete Lifecycle Demo
 *
 * Shows the full egg lifecycle: falling → landing → hatching → chick running off
 *
 * States:
 * - Waiting: Initial state before falling starts
 * - Falling: Egg falls with gravity and rotation
 * - Landed: Transition state when egg hits ground
 * - Hatching: Egg hatches and chick emerges (brief pause)
 * - ChickRunning: Chick runs off screen in a random direction
 *
 * Features:
 * - Reuses falling physics from egg-splat demo
 * - Random chick run direction (left or right)
 * - Chick runs until off screen
 */

// Configuration
const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  chickWidth: 60,
  chickHeight: 60,
  gravity: 0.15,
  startY: 100,
  maxVelocity: 8,
  rotationSpeed: 5, // Degrees per frame
  chickSpeed: 3, // Pixels per frame
  hatchDuration: 1000, // 1 second pause to show hatched chick
};

const eggHatchMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
      rotationDirection?: Direction['value'];
      chickRunDirection?: Direction['value']; // Which way chick runs
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
      chickRunDirection: Direction['value'];
      canvasWidth: number;
      canvasHeight: number;
      groundY: number; // Y position where egg hits ground
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<any> }
      | { type: 'Start' }
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
        // Rotate the egg continuously while falling
        return (
          context.rotation +
          context.rotationDirection * DEMO_CONFIG.rotationSpeed
        );
      },
    }),
    positionEggOnGround: assign({
      position: ({ context }) => ({
        // Convert from center-based (falling with offsetX/offsetY) to left-edge-based (chick without offsets)
        // The falling egg position.x was the center, so subtract half width to get left edge
        x: context.position.x - DEMO_CONFIG.chickWidth / 2,
        y: context.groundY - DEMO_CONFIG.eggHeight,
      }),
      velocity: 0, // Stop all movement
      rotation: 0, // Reset rotation for clean hatch
    }),
    updateChickPosition: assign({
      position: ({ context }) => {
        const newX =
          context.position.x +
          context.chickRunDirection * DEMO_CONFIG.chickSpeed;
        return {
          x: newX,
          y: context.position.y,
        };
      },
    }),
  },
  guards: {
    hasLanded: ({ context }) => {
      return context.position.y + DEMO_CONFIG.eggHeight >= context.groundY;
    },
    chickOffScreen: ({ context }) => {
      // Check if chick has run completely off screen
      if (context.chickRunDirection === 1) {
        // Running right
        return (
          context.position.x > context.canvasWidth + DEMO_CONFIG.chickWidth
        );
      } else {
        // Running left
        return context.position.x < -DEMO_CONFIG.chickWidth;
      }
    },
  },
  delays: {
    hatchDuration: DEMO_CONFIG.hatchDuration,
  },
}).createMachine({
  id: 'Egg-Hatch',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    // Since we use offsetX/offsetY for rotation, position.x IS the center point
    const eggCenterX = Math.floor(canvasWidth / 2);
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    // Randomly choose which way the chick runs (or use input)
    const chickRunDirection =
      input.chickRunDirection ?? (Math.random() < 0.5 ? -1 : 1);

    return {
      eggRef: { current: null },
      id: input.id,
      position: input.startPosition || {
        x: eggCenterX,
        y: DEMO_CONFIG.startY,
      },
      velocity: 0,
      rotation: 0,
      rotationDirection: input.rotationDirection ?? 1,
      chickRunDirection,
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
        Start: 'Falling',
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
      always: {
        target: 'Hatching',
        actions: 'positionEggOnGround',
      },
    },
    Hatching: {
      // Show hatching animation for a brief moment
      after: {
        hatchDuration: 'ChickRunning',
      },
    },
    ChickRunning: {
      on: {
        Update: [
          {
            guard: 'chickOffScreen',
            target: 'Complete',
          },
          {
            actions: 'updateChickPosition',
          },
        ],
      },
    },
    Complete: {
      type: 'final',
    },
  },
});

export default eggHatchMachine;
export type EggHatchActorRef = ActorRefFrom<typeof eggHatchMachine>;
