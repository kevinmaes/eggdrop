import Konva from 'konva';
import { assign, setup } from 'xstate';

import { tweenActor, type TweenConfig } from '../../../tweenActor';
import { isImageRef } from '../../../types';

import type { Position } from '../../../types';

/**
 * Egg Falling Machine - Using Invoked TweenActor Pattern
 *
 * Demonstrates a falling egg using the same invoked actor pattern as the real game.
 * The egg starts at the top (roughly where a hen would be)
 * and falls straight down to the bottom of the screen.
 *
 * Pattern (matching real game):
 * - Declares tweenActor as an invokable actor
 * - Creates Konva.Tween on entry to Falling state
 * - Invokes tweenActor to play the tween
 * - Tween completes and transitions to OffScreen
 *
 * Physics:
 * - Konva.Tween handles the animation
 * - Duration-based (not velocity-based like RAF pattern)
 * - Includes rotation for visual interest
 */

// Configuration using shared constants
const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  fallingDuration: 3, // Duration in seconds for the fall
};

export const eggFallingMachine = setup({
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
      currentTweenDurationMS: number;
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> }
      | { type: 'Play' };
  },
  actors: {
    fallingTweenActor: tweenActor,
  },
  actions: {
    setEggRef: assign(({ context }, params: React.RefObject<Konva.Image>) => {
      // Set the node position immediately when ref is attached
      if (isImageRef(params)) {
        params.current.setPosition(context.position);
      }
      return { eggRef: params };
    }),
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
  /** @xstate-layout N4IgpgJg5mDOIC5QFEpQLQDECGAbXAlgHZQDEAymAC4AEYaASmAGYDaADALqKgAOA9rAJUC-IjxAAPRAGYA7ACYAdDIBsMgByrVGgCwaArKoCMB3QBoQAT0TpjGpfYML2ATmOr2W12tUBfP0tUDBx8YiglAEkIXDBSAAVcbCsObiQQASERMQlpBGMZdiV3dgNXNzlFDQLLGwQFDyUNDTkDPQV1OVNFAKC0LDxCEiVQobIIMTAlYgA3fgBrKeCBsOHR8IRZ-gBjbGyiVNSJTOFRcXS83UUlAzV2Y3dtQsVVWsQHgyaNdlVddkU5LpXNUZAFAiAiPwIHAJMt1iRjoJTjkLrZjG8ED4lAoysZ7qoOnJVK51L0QHDBuEojEwIismdcogrhiGqolETyq5dKoDIpSnJQeCKasIvCoHTkedQHkFAoZI49BpXEYCSS5K4MfYiro-q45F4ZOVjMZWmThWMlAB5ZjMcjbABOYDAUoySP2jIQxKKgJk+iB7AUVxkMhZphuDQ6BhNMnswIMYL8QA */
  id: 'Egg-Falling',
  context: ({ input }) => {
    return {
      eggRef: { current: null },
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
  on: {
    'Set eggRef': {
      actions: {
        type: 'setEggRef',
        params: ({ event }) => event.eggRef,
      },
    },
  },
  initial: 'Idle',
  states: {
    Idle: {
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
          };

          return {
            node: context.eggRef.current,
            config,
          };
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
