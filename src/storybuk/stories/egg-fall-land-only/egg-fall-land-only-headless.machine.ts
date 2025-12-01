import { setup, assign, type ActorRefFrom } from 'xstate';

import { STAGE_PADDING } from '../../story-constants';

import type { Direction, Position } from '../../../types';

/**
 * Headless Falling + Landing Only Demo
 *
 * Inspector-compatible version focusing on falling and landing:
 * - Waiting
 * - Falling (gravity + rotation)
 * - Landed (positions egg on ground)
 * - Done
 */

const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  gravity: 0.15,
  startY: 100,
  maxVelocity: 8,
  rotationSpeed: 5,
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
      velocity: number;
      rotation: number;
      rotationDirection: Direction['value'];
      canvasWidth: number;
      canvasHeight: number;
      groundY: number;
    };
    events: { type: 'Start' } | { type: 'Update' };
  },
  actions: {
    updatePositionAndRotation: assign({
      position: ({ context }) => {
        const newY = context.position.y + context.velocity;
        return {
          x: context.position.x,
          y: newY,
        };
      },
      velocity: ({ context }) => {
        const newVelocity = context.velocity + DEMO_CONFIG.gravity;
        return Math.min(newVelocity, DEMO_CONFIG.maxVelocity);
      },
      rotation: ({ context }) => {
        return (
          context.rotation +
          context.rotationDirection * DEMO_CONFIG.rotationSpeed
        );
      },
    }),
    positionEggOnGround: assign({
      position: ({ context }) => ({
        x: context.position.x,
        y: context.groundY - DEMO_CONFIG.eggHeight / 2,
      }),
      velocity: 0,
      rotation: 0,
    }),
  },
  guards: {
    hasLanded: ({ context }) => {
      return context.position.y + DEMO_CONFIG.eggHeight / 2 >= context.groundY;
    },
  },
}).createMachine({
  id: 'Egg-Fall-Land-Only-Headless',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const eggCenterX = Math.floor(canvasWidth / 2);
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    return {
      id: input.id,
      position: input.startPosition || {
        x: eggCenterX,
        y: DEMO_CONFIG.startY,
      },
      velocity: 0,
      rotation: 0,
      rotationDirection: input.rotationDirection ?? 1,
      canvasWidth,
      canvasHeight,
      groundY,
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
      on: {
        Update: [
          {
            guard: 'hasLanded',
            target: 'Landed',
          },
          {
            actions: 'updatePositionAndRotation',
          },
        ],
      },
    },
    Landed: {
      entry: 'positionEggOnGround',
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
