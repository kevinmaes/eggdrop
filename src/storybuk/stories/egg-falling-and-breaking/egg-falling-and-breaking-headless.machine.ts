import { setup, assign, type ActorRefFrom } from 'xstate';

import { STAGE_PADDING } from '../../story-constants';
import {
  tweenActorHeadless,
  type TweenConfigHeadless,
} from '../../tweenActorHeadless';

import type { Position } from '../../../types';

/**
 * Headless Egg Falling and Breaking Machine - Using Tween Actor Pattern
 *
 * This is a version of egg-falling-and-breaking.machine.ts with all React ref dependencies removed.
 * It maintains the same state structure and logic but uses tween actor for animation.
 *
 * Purpose: Enable Stately Inspector integration without serialization issues.
 *
 * States:
 * - Waiting: Initial state before falling starts
 * - Falling: Egg falls with tween animation and rotation
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
  fallingDuration: 3, // seconds
};

export const eggFallingAndBreakingHeadlessMachine = setup({
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
      groundY: number;
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
        y: context.groundY - DEMO_CONFIG.eggHeight / 2,
      }),
      currentTweenDurationMS: () => DEMO_CONFIG.fallingDuration * 1000,
    }),
    setFinalPosition: assign({
      position: (_, params: Position) => params,
    }),
    splatOnFloor: assign({
      position: ({ context }) => ({
        // Center the broken egg sprite on the egg's center position
        // Since the egg now uses offsetX/offsetY for rotation, position.x is the center
        x: context.position.x - DEMO_CONFIG.brokenEggWidth / 2,
        y: context.groundY - DEMO_CONFIG.brokenEggHeight,
      }),
    }),
  },
}).createMachine({
  id: 'Egg-Falling-And-Breaking-Headless',
  context: ({ input }) => {
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    return {
      id: input.id,
      position: input.startPosition,
      targetPosition: { x: 0, y: 0 },
      canvasHeight,
      groundY,
      currentTweenDurationMS: 0,
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
      entry: 'setTweenProperties',
      invoke: {
        src: 'fallingTweenActor',
        input: ({ context }) => {
          const config: TweenConfigHeadless = {
            durationMS: context.currentTweenDurationMS,
            x: context.targetPosition.x,
            y: context.targetPosition.y,
            rotation: Math.random() > 0.5 ? 720 : -720,
          };

          return { config };
        },
        onDone: {
          target: 'Landed',
          actions: {
            type: 'setFinalPosition',
            params: ({ event }) => event.output,
          },
        },
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

export type EggFallingAndBreakingHeadlessActorRef = ActorRefFrom<
  typeof eggFallingAndBreakingHeadlessMachine
>;
