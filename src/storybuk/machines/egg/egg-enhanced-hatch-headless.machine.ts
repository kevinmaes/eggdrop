import { setup, assign, type ActorRefFrom } from 'xstate';

import { STAGE_PADDING } from '../../story-constants';

import type { Direction, Position } from '../../../types';

/**
 * Headless Enhanced Egg Hatch Machine
 *
 * This is a version of egg-enhanced-hatch.machine.ts with all React ref dependencies removed.
 * It maintains the same state structure and logic but uses pure data for position updates.
 *
 * Purpose: Enable Stately Inspector integration without serialization issues.
 *
 * States:
 * - Waiting → Falling → Landed → Cracking → Hatching → JumpingUp → BouncingDown → Walking → Complete
 */

// Configuration (must match visual version)
const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  chickWidth: 60,
  chickHeight: 60,
  gravity: 0.15,
  startY: 100,
  maxVelocity: 8,
  rotationSpeed: 5,
  crackDuration: 500,
  hatchDuration: 300,
  jumpUpDuration: 400,
  jumpHeight: 70,
  bounceDuration: 400,
  walkSpeed: 2,
  crackWobbleAmount: 10,
};

const eggEnhancedHatchHeadlessMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
      rotationDirection?: Direction['value'];
      chickWalkDirection?: Direction['value'];
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
      chickWalkDirection: Direction['value'];
      canvasWidth: number;
      canvasHeight: number;
      groundY: number;
      jumpStartY: number;
      jumpStartTime: number;
      crackStartTime: number;
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
      rotation: 0,
    }),
    startCracking: assign({
      crackStartTime: () => Date.now(),
    }),
    updateCrackAnimation: assign({
      rotation: ({ context }) => {
        const elapsed = Date.now() - context.crackStartTime;
        const progress = Math.min(elapsed / DEMO_CONFIG.crackDuration, 1);
        const wobble =
          Math.sin(progress * Math.PI * 8) *
          DEMO_CONFIG.crackWobbleAmount *
          (1 - progress);
        return wobble;
      },
    }),
    prepareForJump: assign({
      position: ({ context }) => ({
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
  id: 'Egg-Enhanced-Hatch-Headless',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const eggCenterX = Math.floor(canvasWidth / 2);
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    const chickWalkDirection =
      input.chickWalkDirection ?? (Math.random() < 0.5 ? -1 : 1);

    return {
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

export default eggEnhancedHatchHeadlessMachine;
export type EggEnhancedHatchHeadlessActorRef = ActorRefFrom<
  typeof eggEnhancedHatchHeadlessMachine
>;
