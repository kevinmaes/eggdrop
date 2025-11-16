import { setup, assign, type ActorRefFrom } from 'xstate';

import { STAGE_PADDING } from '../../story-constants';

import type { Position } from '../../../types';

/**
 * Headless Hatching Jump Only Demo
 *
 * Inspector-compatible version focusing on the hatching jump sequence:
 * - Waiting (chick in shell on ground)
 * - Hatching (300ms pause)
 * - Hatching Jump (Jumping Up → Bouncing Down)
 * - Hatched (500ms pause)
 * - Done
 */

const DEMO_CONFIG = {
  chickWidth: 60,
  chickHeight: 60,
  hatchingPauseDuration: 300,
  jumpUpDuration: 400,
  jumpHeight: 70,
  bounceDuration: 400,
  hatchedPauseDuration: 500,
};

const eggHatchJumpOnlyHeadlessMachine = setup({
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
      canvasWidth: number;
      canvasHeight: number;
      groundY: number;
      jumpStartY: number;
      jumpStartTime: number;
    };
    events: { type: 'Start' } | { type: 'Update' };
  },
  actions: {
    prepareForJump: assign({
      jumpStartY: ({ context }) =>
        context.groundY - DEMO_CONFIG.chickHeight / 2,
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
  },
  guards: {
    jumpUpComplete: ({ context }) => {
      const elapsed = Date.now() - context.jumpStartTime;
      return elapsed >= DEMO_CONFIG.jumpUpDuration;
    },
    bounceComplete: ({ context }) => {
      const elapsed = Date.now() - context.jumpStartTime;
      return elapsed >= DEMO_CONFIG.bounceDuration;
    },
  },
  delays: {
    hatchingPauseDuration: DEMO_CONFIG.hatchingPauseDuration,
    hatchedPauseDuration: DEMO_CONFIG.hatchedPauseDuration,
  },
}).createMachine({
  id: 'Egg-Hatch-Jump-Only-Headless',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;
    const centerX = Math.floor(canvasWidth / 2);

    return {
      id: input.id,
      position: input.startPosition || {
        x: centerX,
        y: groundY - DEMO_CONFIG.chickHeight / 2,
      },
      canvasWidth,
      canvasHeight,
      groundY,
      jumpStartY: 0,
      jumpStartTime: 0,
    };
  },
  output: ({ context }) => ({
    eggId: context.id,
  }),
  initial: 'Waiting',
  states: {
    Waiting: {
      on: {
        Start: 'Hatching',
      },
    },
    Hatching: {
      entry: 'prepareForJump',
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
      after: {
        hatchedPauseDuration: 'Done',
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export default eggHatchJumpOnlyHeadlessMachine;
export type EggHatchJumpOnlyHeadlessActorRef = ActorRefFrom<
  typeof eggHatchJumpOnlyHeadlessMachine
>;
