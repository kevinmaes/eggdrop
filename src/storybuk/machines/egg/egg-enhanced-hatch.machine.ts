import { setup, assign, type ActorRefFrom } from 'xstate';

import type { Direction, Position } from '../../../types';

/**
 * Enhanced Egg Hatch Machine - Detailed Hatching Animation
 *
 * Shows a more realistic hatching sequence with animations:
 * - Egg falls and lands
 * - Egg cracks (shake animation)
 * - Chick hatches and appears
 * - Chick jumps up and bounces down
 * - Chick walks off screen
 *
 * States:
 * - Waiting: Initial state before falling
 * - Falling: Egg falls with gravity and rotation
 * - Landed: Transition state when egg hits ground
 * - Cracking: Egg shakes/wobbles to simulate cracking (500ms)
 * - Hatching: Chick emerges from shell (300ms)
 * - JumpingUp: Chick jumps up from shell (400ms)
 * - BouncingDown: Chick bounces back down (400ms)
 * - Walking: Chick walks off screen with animated frames
 * - Complete: Final state
 *
 * Based on the real game's egg.machine.ts hatching sequence.
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
  rotationSpeed: 5, // Degrees per frame while falling
  crackDuration: 500, // How long the cracking animation lasts
  hatchDuration: 300, // How long to show hatched chick before jumping
  jumpUpDuration: 400, // Duration of jump up animation
  jumpHeight: 70, // How high the chick jumps
  bounceDuration: 400, // Duration of bounce down animation
  walkSpeed: 2, // Pixels per frame while walking
  crackWobbleAmount: 10, // Degrees to wobble during cracking
};

const eggEnhancedHatchMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
      rotationDirection?: Direction['value'];
      chickWalkDirection?: Direction['value']; // Which way chick walks
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
      chickWalkDirection: Direction['value'];
      canvasWidth: number;
      canvasHeight: number;
      groundY: number;
      jumpStartY: number; // Y position where jump starts
      jumpStartTime: number; // Timestamp when jump animation starts
      crackStartTime: number; // Timestamp when cracking starts
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
        return (
          context.rotation +
          context.rotationDirection * DEMO_CONFIG.rotationSpeed
        );
      },
    }),
    positionEggOnGround: assign({
      position: ({ context }) => ({
        x: context.position.x,
        y: context.groundY - DEMO_CONFIG.eggHeight,
      }),
      velocity: 0,
      rotation: 0, // Reset rotation for cracking animation
    }),
    startCracking: assign({
      crackStartTime: () => Date.now(),
    }),
    updateCrackAnimation: assign({
      rotation: ({ context }) => {
        // Wobble animation: oscillate rotation during cracking
        const elapsed = Date.now() - context.crackStartTime;
        const progress = Math.min(elapsed / DEMO_CONFIG.crackDuration, 1);
        // Use sine wave for wobble effect (faster wobbles as it progresses)
        const wobble =
          Math.sin(progress * Math.PI * 8) *
          DEMO_CONFIG.crackWobbleAmount *
          (1 - progress); // Decrease amplitude over time
        return wobble;
      },
    }),
    prepareForJump: assign({
      position: ({ context }) => ({
        // Convert from center-based (egg) to left-edge-based (chick)
        x: context.position.x - DEMO_CONFIG.chickWidth / 2,
        y: context.groundY - DEMO_CONFIG.chickHeight,
      }),
      rotation: 0,
      jumpStartY: ({ context }) => context.groundY - DEMO_CONFIG.chickHeight,
      jumpStartTime: () => Date.now(),
    }),
    updateJumpUp: assign({
      position: ({ context }) => {
        const elapsed = Date.now() - context.jumpStartTime;
        const progress = Math.min(elapsed / DEMO_CONFIG.jumpUpDuration, 1);
        // EaseOut function: decelerating to zero velocity
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const jumpOffset = easeOut * DEMO_CONFIG.jumpHeight;
        return {
          x: context.position.x,
          y: context.jumpStartY - jumpOffset,
        };
      },
    }),
    startBounce: assign({
      jumpStartTime: () => Date.now(),
    }),
    updateBounceDown: assign({
      position: ({ context }) => {
        const elapsed = Date.now() - context.jumpStartTime;
        const progress = Math.min(elapsed / DEMO_CONFIG.bounceDuration, 1);
        // BounceEaseOut function
        const bounceEaseOut = (t: number) => {
          if (t < 1 / 2.75) {
            return 7.5625 * t * t;
          } else if (t < 2 / 2.75) {
            const t2 = t - 1.5 / 2.75;
            return 7.5625 * t2 * t2 + 0.75;
          } else if (t < 2.5 / 2.75) {
            const t2 = t - 2.25 / 2.75;
            return 7.5625 * t2 * t2 + 0.9375;
          } else {
            const t2 = t - 2.625 / 2.75;
            return 7.5625 * t2 * t2 + 0.984375;
          }
        };
        const bounce = bounceEaseOut(progress);
        const jumpOffset = (1 - bounce) * DEMO_CONFIG.jumpHeight;
        return {
          x: context.position.x,
          y: context.jumpStartY - jumpOffset,
        };
      },
    }),
    updateWalkPosition: assign({
      position: ({ context }) => {
        const newX =
          context.position.x +
          context.chickWalkDirection * DEMO_CONFIG.walkSpeed;
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
    crackingComplete: ({ context }) => {
      const elapsed = Date.now() - context.crackStartTime;
      return elapsed >= DEMO_CONFIG.crackDuration;
    },
    jumpUpComplete: ({ context }) => {
      const elapsed = Date.now() - context.jumpStartTime;
      return elapsed >= DEMO_CONFIG.jumpUpDuration;
    },
    bounceComplete: ({ context }) => {
      const elapsed = Date.now() - context.jumpStartTime;
      return elapsed >= DEMO_CONFIG.bounceDuration;
    },
    chickOffScreen: ({ context }) => {
      if (context.chickWalkDirection === 1) {
        return (
          context.position.x > context.canvasWidth + DEMO_CONFIG.chickWidth
        );
      } else {
        return context.position.x < -DEMO_CONFIG.chickWidth;
      }
    },
  },
  delays: {
    hatchDuration: DEMO_CONFIG.hatchDuration,
  },
}).createMachine({
  id: 'Egg-Enhanced-Hatch',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const eggCenterX = Math.floor(canvasWidth / 2);
    const groundY = canvasHeight - 50;

    const chickWalkDirection =
      input.chickWalkDirection ?? (Math.random() < 0.5 ? -1 : 1);

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
      chickWalkDirection,
      canvasWidth,
      canvasHeight,
      groundY,
      jumpStartY: 0,
      jumpStartTime: 0,
      crackStartTime: 0,
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
        target: 'Cracking',
        actions: ['positionEggOnGround', 'startCracking'],
      },
    },
    Cracking: {
      on: {
        Update: [
          {
            guard: 'crackingComplete',
            target: 'Hatching',
            actions: 'prepareForJump',
          },
          {
            actions: 'updateCrackAnimation',
          },
        ],
      },
    },
    Hatching: {
      after: {
        hatchDuration: 'JumpingUp',
      },
    },
    JumpingUp: {
      entry: 'startBounce',
      on: {
        Update: [
          {
            guard: 'jumpUpComplete',
            target: 'BouncingDown',
            actions: 'startBounce',
          },
          {
            actions: 'updateJumpUp',
          },
        ],
      },
    },
    BouncingDown: {
      on: {
        Update: [
          {
            guard: 'bounceComplete',
            target: 'Walking',
          },
          {
            actions: 'updateBounceDown',
          },
        ],
      },
    },
    Walking: {
      on: {
        Update: [
          {
            guard: 'chickOffScreen',
            target: 'Complete',
          },
          {
            actions: 'updateWalkPosition',
          },
        ],
      },
    },
    Complete: {
      type: 'final',
    },
  },
});

export default eggEnhancedHatchMachine;
export type EggEnhancedHatchActorRef = ActorRefFrom<
  typeof eggEnhancedHatchMachine
>;
