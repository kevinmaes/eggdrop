import { setup, assign, type ActorRefFrom } from 'xstate';

import type { Direction, Position } from '../../../types';

/**
 * Game-Accurate Egg Hatch Machine
 *
 * Matches the exact hatching sequence from the real game's egg.machine.ts:
 * - Egg falls with rotation
 * - Lands on ground
 * - Hatching: 300ms pause showing chick emerging
 * - Hatching Jump:
 *   - Jumping Up: 400ms, 70px up, easeOut
 *   - Bouncing Down: 400ms, bounceEaseOut
 * - Hatched: 500ms pause
 * - Exiting: 1s slide to exit position
 * - Done
 *
 * This demo matches the actual game behavior exactly (no extra states like Cracking).
 */

const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  chickWidth: 60,
  chickHeight: 60,
  gravity: 0.15,
  startY: 100,
  maxVelocity: 8,
  rotationSpeed: 5,
  hatchingPauseDuration: 300, // From game
  jumpUpDuration: 400, // From game
  jumpHeight: 70, // From game
  bounceDuration: 400, // From game
  hatchedPauseDuration: 500, // From game
  exitDuration: 1000, // From game (1 second)
  exitSpeed: 10, // Pixels per frame for exiting
};

const eggHatchGameAccurateMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
      rotationDirection?: Direction['value'];
      chickExitDirection?: Direction['value'];
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
      chickExitDirection: Direction['value'];
      canvasWidth: number;
      canvasHeight: number;
      groundY: number;
      jumpStartY: number;
      jumpStartTime: number;
      exitStartTime: number;
      exitStartX: number;
      exitTargetX: number;
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
      rotation: 0,
    }),
    prepareForJump: assign({
      position: ({ context }) => ({
        // Keep center-based positioning (chick now uses offsetX/offsetY)
        x: context.position.x,
        y: context.groundY - DEMO_CONFIG.chickHeight / 2,
      }),
      jumpStartY: ({ context }) =>
        context.groundY - DEMO_CONFIG.chickHeight / 2,
      jumpStartTime: () => Date.now(),
    }),
    updateJumpUp: assign({
      position: ({ context }) => {
        const elapsed = Date.now() - context.jumpStartTime;
        const progress = Math.min(elapsed / DEMO_CONFIG.jumpUpDuration, 1);
        // EaseOut: decelerating to zero velocity
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
        // BounceEaseOut from Konva
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
    prepareForExit: assign({
      exitStartTime: () => Date.now(),
      exitStartX: ({ context }) => context.position.x,
      exitTargetX: ({ context }) => {
        // Exit to left or right edge
        if (context.chickExitDirection === 1) {
          return context.canvasWidth + DEMO_CONFIG.chickWidth;
        } else {
          return -DEMO_CONFIG.chickWidth;
        }
      },
    }),
    updateExitPosition: assign({
      position: ({ context }) => {
        const elapsed = Date.now() - context.exitStartTime;
        const progress = Math.min(elapsed / DEMO_CONFIG.exitDuration, 1);
        // Linear interpolation from start to target
        const newX =
          context.exitStartX +
          (context.exitTargetX - context.exitStartX) * progress;
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
    jumpUpComplete: ({ context }) => {
      const elapsed = Date.now() - context.jumpStartTime;
      return elapsed >= DEMO_CONFIG.jumpUpDuration;
    },
    bounceComplete: ({ context }) => {
      const elapsed = Date.now() - context.jumpStartTime;
      return elapsed >= DEMO_CONFIG.bounceDuration;
    },
    exitComplete: ({ context }) => {
      const elapsed = Date.now() - context.exitStartTime;
      return elapsed >= DEMO_CONFIG.exitDuration;
    },
  },
  delays: {
    hatchingPauseDuration: DEMO_CONFIG.hatchingPauseDuration,
    hatchedPauseDuration: DEMO_CONFIG.hatchedPauseDuration,
  },
}).createMachine({
  id: 'Egg-Hatch-Game-Accurate',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const eggCenterX = Math.floor(canvasWidth / 2);
    const groundY = canvasHeight - 50;

    const chickExitDirection =
      input.chickExitDirection ?? (Math.random() < 0.5 ? -1 : 1);

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
      chickExitDirection,
      canvasWidth,
      canvasHeight,
      groundY,
      jumpStartY: 0,
      jumpStartTime: 0,
      exitStartTime: 0,
      exitStartX: 0,
      exitTargetX: 0,
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
        actions: ['positionEggOnGround', 'prepareForJump'],
      },
    },
    Hatching: {
      // 300ms pause showing chick in hatched pose
      after: {
        hatchingPauseDuration: 'Hatching Jump',
      },
    },
    'Hatching Jump': {
      initial: 'Jumping Up',
      states: {
        'Jumping Up': {
          on: {
            Update: [
              {
                guard: 'jumpUpComplete',
                target: 'Bouncing Down',
                actions: 'startBounce',
              },
              {
                actions: 'updateJumpUp',
              },
            ],
          },
        },
        'Bouncing Down': {
          on: {
            Update: [
              {
                guard: 'bounceComplete',
                target: 'Animation Done',
              },
              {
                actions: 'updateBounceDown',
              },
            ],
          },
        },
        'Animation Done': {
          type: 'final',
        },
      },
      onDone: 'Hatched',
    },
    Hatched: {
      // 500ms pause after landing from bounce
      after: {
        hatchedPauseDuration: 'Exiting',
      },
    },
    Exiting: {
      entry: 'prepareForExit',
      on: {
        Update: [
          {
            guard: 'exitComplete',
            target: 'Done',
          },
          {
            actions: 'updateExitPosition',
          },
        ],
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export default eggHatchGameAccurateMachine;
export type EggHatchGameAccurateActorRef = ActorRefFrom<
  typeof eggHatchGameAccurateMachine
>;
