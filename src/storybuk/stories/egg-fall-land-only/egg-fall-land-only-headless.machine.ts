import { setup, assign, type ActorRefFrom } from 'xstate';

import { STAGE_PADDING } from '../../story-constants';
import {
  tweenActorHeadless,
  type TweenConfigHeadless,
} from '../../tweenActorHeadless';

import type { Direction, Position } from '../../../types';

/**
 * Headless Falling + Landing Only Demo - Using Tween Actor Pattern
 *
 * Inspector-compatible version using tween actor for falling animation:
 * - Waiting
 * - Falling (tween-based animation with rotation)
 * - Landed (positions egg on ground)
 * - Done
 */

const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  fallingDuration: 3, // Duration in seconds for the fall
};

export const eggFallLandOnlyHeadlessMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
      rotationDirection?: Direction['value'];
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
  },
}).createMachine({
  id: 'Egg-Fall-Land-Only-Headless',
  context: ({ input }) => {
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    return {
      id: input.id,
      position: input.startPosition,
      targetPosition: input.startPosition,
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
        target: 'Done',
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export type EggFallLandOnlyHeadlessActorRef = ActorRefFrom<
  typeof eggFallLandOnlyHeadlessMachine
>;
