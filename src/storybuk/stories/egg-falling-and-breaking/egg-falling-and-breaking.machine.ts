import Konva from 'konva';
import { setup, assign, type ActorRefFrom } from 'xstate';

import { tweenActor, type TweenConfig } from '../../../tweenActor';
import { isImageRef } from '../../../types';
import { STAGE_PADDING } from '../../story-constants';

import type { Position } from '../../../types';

/**
 * Egg Falling and Breaking Machine - Using Tween Actor Pattern
 *
 * Based on the real egg.machine.ts but with complexities stripped out.
 * Demonstrates a simple falling and splatting animation using tween actor.
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

export const eggFallingAndBreakingMachine = setup({
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
      eggRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      targetPosition: Position;
      canvasHeight: number;
      groundY: number;
      currentTweenDurationMS: number;
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<any> }
      | { type: 'Play' };
  },
  actors: {
    fallingTweenActor: tweenActor,
  },
  actions: {
    setEggRef: assign({
      eggRef: (_, params: React.RefObject<any>) => params,
    }),
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
  id: 'Egg-Falling-And-Breaking',
  context: ({ input }) => {
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    return {
      eggRef: { current: null },
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
      entry: 'setTweenProperties',
      invoke: {
        src: 'fallingTweenActor',
        input: ({ context }) => {
          if (!isImageRef(context.eggRef)) {
            throw new Error('Egg ref is not set');
          }

          const config: TweenConfig = {
            durationMS: context.currentTweenDurationMS,
            x: context.targetPosition.x,
            y: context.targetPosition.y,
            rotation: Math.random() > 0.5 ? 720 : -720,
          };

          return { node: context.eggRef.current, config };
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

export type EggFallingAndBreakingActorRef = ActorRefFrom<
  typeof eggFallingAndBreakingMachine
>;
