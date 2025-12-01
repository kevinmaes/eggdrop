import Konva from 'konva';
import { assign, setup } from 'xstate';

import { EGG_ROTATION } from '../../../constants';
import { tweenActor } from '../../../tweenActor';
import { isImageRef } from '../../../types';

import type { Position } from '../../../types';

/**
 * Egg Falling with Rotation Machine - Using Invoked TweenActor Pattern
 *
 * Demonstrates a falling egg with rotation using the same pattern as the real game.
 * The egg starts at the top and falls straight down while rotating clockwise.
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

export const eggFallingRotatingMachine = setup({
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
  /** @xstate-layout N4IgpgJg5mDOIC5QFEpQLQDECGAbXAlgHYYBKA9gC7aXFQDEAymJQARhqlgBmA2gAwBdRKAAO5WAVrkiIkAA9EAZgCsSgHRKAjAE4lAFgBMWgGwAOHfzMmlAGhABPROi0r1hwya0eTvw-wCTQwBfYPtUDBx8OnQKaloSdQBJCFwwegAFXGwHAWEkEHFJaVkCxQQtJX51HS1+FTNDWu0dAHZ2+ycEYxN1MzNWhqVWxu0DfVDwtCw8QhJYqho6dSi5hggZMHViADdyAGstiJno+bilxNW6BF3yAGMlmTy8uSKpAhk5cv0dNzN9JRjRr8VQ6fSdRC6P5mfgmfg6EyWX4DFShMIgIjkCBwOTHK5nRYJKCvCTvT5lZxaCEIPTuFSWf78VpWGH8LSTEB42Yxc5E5KpMAk4ofUqgb6tak9dStRH1fRDQGWEwcrmnMiE5b44kFN4lL6IDwaLT-AaAob6fQmCWOSEw9QW+GefQyjwy1oq6ZahbxZYAeW43EYdwATmAwKLCqS9RSEK0tPp1PUmWDBh5TJLXOoVMYenGLP5+BM0UA */
  id: 'Egg-Falling-Rotating',
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

          return {
            node: context.eggRef.current,
            config: {
              durationMS: context.currentTweenDurationMS,
              x: context.targetPosition.x,
              y: context.targetPosition.y,
              rotation: EGG_ROTATION.CLOCKWISE_TWO_SPINS,
            },
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
