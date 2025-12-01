import { setup, assign, type ActorRefFrom } from 'xstate';

import { STAGE_PADDING } from '../../story-constants';
import {
  tweenActorHeadless,
  type TweenConfigHeadless,
} from '../../tweenActorHeadless';

import type { Position } from '../../../types';

/**
 * Headless Egg Land and Hatch Demo - Using Tween Actor Pattern
 *
 * Inspector-compatible version showing egg landing and hatching:
 * - Waiting
 * - Falling (tween-based with rotation)
 * - Landed (positions egg on ground)
 * - Hatching (300ms pause showing chick in shell)
 * - Done
 */

const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  chickWidth: 60,
  chickHeight: 60,
  fallingDuration: 3,
  hatchingPauseDuration: 300,
};

export const eggLandHatchHeadlessMachine = setup({
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
      canvasWidth: number;
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
    positionChickOnGround: assign({
      position: ({ context }) => ({
        x: context.position.x,
        y: context.groundY - DEMO_CONFIG.chickHeight / 2,
      }),
    }),
  },
  delays: {
    hatchingPauseDuration: DEMO_CONFIG.hatchingPauseDuration,
  },
}).createMachine({
  id: 'Egg-Land-Hatch-Headless',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    return {
      id: input.id,
      position: input.startPosition,
      targetPosition: { x: 0, y: 0 },
      canvasWidth,
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
        target: 'Hatching',
        actions: 'positionChickOnGround',
      },
    },
    Hatching: {
      after: {
        hatchingPauseDuration: 'Done',
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export type EggLandHatchHeadlessActorRef = ActorRefFrom<
  typeof eggLandHatchHeadlessMachine
>;
