import { setup, assign, type ActorRefFrom } from 'xstate';

import { STAGE_PADDING } from '../../story-constants';

import type { Direction, Position } from '../../../types';

/**
 * Egg Splat Machine - Simplified Demo
 *
 * Based on the real egg.machine.ts but with complexities stripped out.
 * Demonstrates a simple falling and splatting animation.
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

export const eggSplatMachine = setup({
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
      eggRef: { current: null };
      id: string;
      position: Position;
      velocity: number;
      rotation: number;
      rotationDirection: Direction['value'];
      canvasHeight: number;
      groundY: number; // Y position where egg hits ground
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<any> }
      | { type: 'Play' }
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
  id: 'Egg-Splat',
  context: ({ input }) => {
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    return {
      eggRef: { current: null },
      id: input.id,
      position: input.startPosition,
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

export type EggSplatActorRef = ActorRefFrom<typeof eggSplatMachine>;
