import { assign, setup } from 'xstate';

import { EGG_ROTATION } from '../../../constants';
import {
  tweenActorHeadless,
  type TweenConfigHeadless,
} from '../../tweenActorHeadless';

import type { Position } from '../../../types';

/**
 * Headless Egg Falling with Rotation Machine - Using Tween Actor Pattern
 *
 * This is a version of egg-falling-rotating.machine.ts with all Konva and React dependencies removed.
 * It maintains the same state structure and logic but uses tween actor for animation.
 *
 * Purpose: Enable Stately Inspector integration without serialization issues.
 *
 * Features:
 * - Tween-based animation (no RAF loop)
 * - Rotation during fall
 * - Falls straight down (no horizontal movement)
 */

// Configuration using shared constants
const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  fallingDuration: 3, // Duration in seconds for the fall
};

export const eggFallingRotatingHeadlessMachine = setup({
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
      targetPosition: Position;
      canvasHeight: number;
      currentTweenDurationMS: number;
    };
    events: { type: 'Start' };
  },
  actors: {
    fallingTweenActor: tweenActorHeadless,
  },
  actions: {
    setTweenProperties: assign({
      targetPosition: ({ context }) => ({
        x: context.position.x,
        y: context.canvasHeight + DEMO_CONFIG.eggHeight,
      }),
      currentTweenDurationMS: () => DEMO_CONFIG.fallingDuration * 1000,
    }),
    setFinalPosition: assign({
      position: (_, params: Position) => params,
    }),
  },
}).createMachine({
  id: 'Egg-Falling-Rotating-Headless',
  context: ({ input }) => {
    return {
      id: input.id,
      position: input.startPosition,
      targetPosition: input.startPosition,
      canvasHeight: input.canvasHeight ?? 1080,
      currentTweenDurationMS: 0,
    };
  },
  output: ({ context }) => ({
    eggId: context.id,
  }),
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        Start: 'Falling',
      },
    },
    Falling: {
      entry: 'setTweenProperties',
      invoke: {
        src: 'fallingTweenActor',
        input: ({ context }) => {
          const config: TweenConfigHeadless = {
            durationMS: context.currentTweenDurationMS,
            x: context.targetPosition.x,
            y: context.targetPosition.y,
            rotation: EGG_ROTATION.CLOCKWISE_TWO_SPINS,
          };

          return { config };
        },
        onDone: {
          target: 'OffScreen',
          actions: {
            type: 'setFinalPosition',
            params: ({ event }) => event.output,
          },
        },
      },
    },
    OffScreen: {
      type: 'final',
    },
  },
});
