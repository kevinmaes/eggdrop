import { setup, assign, type ActorRefFrom } from 'xstate';

import { STAGE_PADDING } from '../../story-constants';

import type { Position } from '../../../types';

/**
 * Hatching Jump Only Demo
 *
 * Focuses on just the hatching jump sequence:
 * - Waiting (chick in shell on ground)
 * - Hatching (300ms pause)
 * - Hatching Jump (Jumping Up → Bouncing Down)
 * - Hatched (500ms pause)
 * - Done
 *
 * This isolates the jump animation mechanics for learning purposes.
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

export const eggHatchJumpOnlyMachine = setup({
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
      canvasWidth: number;
      canvasHeight: number;
      groundY: number;
      jumpStartY: number;
      jumpStartTime: number;
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
  id: 'Egg-Hatch-Jump-Only',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;
    const centerX = Math.floor(canvasWidth / 2);

    return {
      eggRef: { current: null },
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
        Play: 'Hatching',
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

export type EggHatchJumpOnlyActorRef = ActorRefFrom<
  typeof eggHatchJumpOnlyMachine
>;
