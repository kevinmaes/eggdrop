import { setup, assign, type ActorRefFrom } from 'xstate';

import type { Direction, Position } from '../../../types';

/**
 * Egg Land and Hatch Demo
 *
 * Simple sequence showing egg landing and hatching:
 * - Waiting
 * - Falling (gravity + rotation)
 * - Landed (positions egg on ground)
 * - Hatching (300ms pause showing chick in shell)
 * - Done
 *
 * This demonstrates the basic hatch transition without jump animation.
 */

const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  chickWidth: 60,
  chickHeight: 60,
  gravity: 0.15,
  startY: 100,
  maxVelocity: 8,
  rotationSpeed: 5,
  hatchingPauseDuration: 300,
};

const eggLandHatchMachine = setup({
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
      eggRef: { current: null };
      id: string;
      position: Position;
      velocity: number;
      rotation: number;
      rotationDirection: Direction['value'];
      canvasWidth: number;
      canvasHeight: number;
      groundY: number;
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<any> }
      | { type: 'Start' }
      | { type: 'Update' };
  },
  actions: {
    setEggRef: assign({
      eggRef: (_, params: React.RefObject<any>) => params,
    }),
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
    positionChickOnGround: assign({
      position: ({ context }) => ({
        x: context.position.x,
        y: context.groundY - DEMO_CONFIG.chickHeight / 2,
      }),
    }),
  },
  guards: {
    hasLanded: ({ context }) => {
      return context.position.y + DEMO_CONFIG.eggHeight / 2 >= context.groundY;
    },
  },
  delays: {
    hatchingPauseDuration: DEMO_CONFIG.hatchingPauseDuration,
  },
}).createMachine({
  id: 'Egg-Land-Hatch',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const eggCenterX = Math.floor(canvasWidth / 2);
    const groundY = canvasHeight - 50;

    return {
      eggRef: { current: null },
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
      always: {
        target: 'Hatching',
        actions: ['positionEggOnGround', 'positionChickOnGround'],
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

export default eggLandHatchMachine;
export type EggLandHatchActorRef = ActorRefFrom<typeof eggLandHatchMachine>;
