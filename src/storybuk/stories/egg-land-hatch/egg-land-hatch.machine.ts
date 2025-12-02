import Konva from 'konva';
import { setup, assign, type ActorRefFrom } from 'xstate';

import { tweenActor, type TweenConfig } from '../../../tweenActor';
import { isImageRef } from '../../../types';
import { STAGE_PADDING } from '../../story-constants';

import type { Position } from '../../../types';

/**
 * Egg Land and Hatch Demo - Using Tween Actor Pattern
 *
 * Simple sequence showing egg landing and hatching:
 * - Waiting
 * - Falling (tween-based with rotation)
 * - Landed (positions egg on ground)
 * - Hatching (final state showing chick in shell)
 *
 * This demonstrates the basic hatch transition without jump animation.
 */

const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  chickWidth: 60,
  chickHeight: 60,
  fallingDuration: 3,
  hatchingPauseDuration: 300,
};

export const eggLandHatchMachine = setup({
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
      canvasWidth: number;
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
    positionChickOnGround: assign({
      position: ({ context }) => ({
        x: context.position.x,
        y: context.groundY - DEMO_CONFIG.chickHeight / 2,
      }),
    }),
  },
}).createMachine({
  id: 'Egg - Land and Hatch',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    return {
      eggRef: { current: null },
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
        target: 'Hatching',
        actions: 'positionChickOnGround',
      },
    },
    Hatching: {
      type: 'final',
    },
  },
});

export type EggLandHatchActorRef = ActorRefFrom<typeof eggLandHatchMachine>;
