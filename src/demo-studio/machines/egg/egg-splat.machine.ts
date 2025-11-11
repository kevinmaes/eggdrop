import { setup, assign, type ActorRefFrom } from 'xstate';

import type { Position } from '../../../types';

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
 * - Splatting: Shows broken egg sprite
 * - Done: Final state
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
  splatDuration: 1500, // How long splat stays visible
};

const eggSplatMachine = setup({
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
      eggRef: { current: null };
      id: string;
      position: Position;
      velocity: number;
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
    updatePosition: assign({
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
    }),
    splatOnFloor: assign({
      position: ({ context }) => ({
        // Center the wider splat sprite on the egg's x position
        x: context.position.x - (DEMO_CONFIG.brokenEggWidth - DEMO_CONFIG.eggWidth) / 2,
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
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const eggCenterX = Math.floor((canvasWidth - DEMO_CONFIG.eggWidth) / 2);
    const groundY = canvasHeight - 50; // Ground is 50px from bottom

    return {
      eggRef: { current: null },
      id: input.id,
      position: input.startPosition || {
        x: eggCenterX,
        y: DEMO_CONFIG.startY,
      },
      velocity: 0,
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
            actions: 'updatePosition',
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
      after: {
        [DEMO_CONFIG.splatDuration]: 'Done',
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export default eggSplatMachine;
export type EggSplatActorRef = ActorRefFrom<typeof eggSplatMachine>;
