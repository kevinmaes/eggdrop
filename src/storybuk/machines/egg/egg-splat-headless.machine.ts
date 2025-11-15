import { setup, assign, type ActorRefFrom } from 'xstate';

import type { Direction, Position } from '../../../types';

/**
 * Headless Egg Splat Machine - Simplified Demo
 *
 * This is a version of egg-splat.machine.ts with all React ref dependencies removed.
 * It maintains the same state structure and logic but uses pure data for position updates.
 *
 * Purpose: Enable Stately Inspector integration without serialization issues.
 *
 * States:
 * - Waiting: Initial state before falling starts
 * - Falling: Egg falls with gravity
 * - Landed: Transition state when egg hits ground
 * - Splatting: Shows broken egg sprite (stays in this state)
 *
 * Features removed from full version:
 * - Hen movement and angled falling
 * - Chef catching
 * - Egg hatching
 * - Chick animations
 * - Game pause/resume
 * - Parent notifications
 */

// Configuration
const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  brokenEggWidth: 90, // Splat is wider
  brokenEggHeight: 60,
  gravity: 0.15,
  startY: 100,
  maxVelocity: 8,
  rotationSpeed: 5, // Degrees per frame
};

const eggSplatHeadlessMachine = setup({
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
      groundY: number; // Y position where egg hits ground
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
    splatOnFloor: assign({
      position: ({ context }) => ({
        // Center the broken egg sprite on the egg's center position
        // Since the egg now uses offsetX/offsetY for rotation, position.x is the center
        x: context.position.x - DEMO_CONFIG.brokenEggWidth / 2,
        y: context.groundY - DEMO_CONFIG.brokenEggHeight,
      }),
      velocity: 0, // Stop all movement
    }),
  },
  guards: {
    hasLanded: ({ context }) => {
      return context.position.y + DEMO_CONFIG.eggHeight >= context.groundY;
    },
  },
}).createMachine({
  id: 'Egg-Splat-Headless',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    // Since we use offsetX/offsetY for rotation, position.x IS the center point
    const eggCenterX = Math.floor(canvasWidth / 2);
    const groundY = canvasHeight - 50; // Ground is 50px from bottom

    return {
      id: input.id,
      position: input.startPosition || {
        x: eggCenterX,
        y: DEMO_CONFIG.startY,
      },
      velocity: 0,
      rotation: 0,
      rotationDirection: input.rotationDirection ?? 1,
      canvasHeight,
      groundY,
    };
  },
  output: ({ context }) => ({
    eggId: context.id,
  }),
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
        target: 'Splatting',
        actions: 'splatOnFloor',
      },
    },
    Splatting: {
      // Stay in splatting state indefinitely - splat remains visible
    },
  },
});

export default eggSplatHeadlessMachine;
export type EggSplatHeadlessActorRef = ActorRefFrom<
  typeof eggSplatHeadlessMachine
>;
