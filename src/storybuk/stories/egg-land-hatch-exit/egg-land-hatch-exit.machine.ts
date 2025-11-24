import { setup, assign, type ActorRefFrom } from 'xstate';

import { STAGE_PADDING } from '../../story-constants';

import type { Direction, Position } from '../../../types';

/**
 * Egg Land, Hatch, and Exit Demo
 *
 * Complete sequence showing egg landing, hatching, and chick exiting:
 * - Waiting
 * - Falling (gravity + rotation)
 * - Landed (positions egg on ground)
 * - Hatching (shows chick in shell)
 * - Hatched (chick standing, brief pause)
 * - Exiting (chick runs off screen)
 * - Done
 *
 * This demonstrates the full hatch cycle without jump animation.
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
  hatchingPauseDuration: 500,
  hatchedPauseDuration: 500,
  exitDuration: 1000,
};

export const eggLandHatchExitMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
      rotationDirection?: Direction['value'];
      chickExitDirection?: Direction['value'];
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
      chickExitDirection: Direction['value'];
      canvasWidth: number;
      canvasHeight: number;
      groundY: number;
      exitStartTime: number;
      exitStartX: number;
      exitTargetX: number;
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<any> }
      | { type: 'Play' }
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
    prepareForExit: assign({
      exitStartTime: () => Date.now(),
      exitStartX: ({ context }) => context.position.x,
      exitTargetX: ({ context }) => {
        if (context.chickExitDirection === 1) {
          return context.canvasWidth + DEMO_CONFIG.chickWidth;
        } else {
          return -DEMO_CONFIG.chickWidth;
        }
      },
    }),
    updateExitPosition: assign({
      position: ({ context }) => {
        const elapsed = Date.now() - context.exitStartTime;
        const progress = Math.min(elapsed / DEMO_CONFIG.exitDuration, 1);
        const newX =
          context.exitStartX +
          (context.exitTargetX - context.exitStartX) * progress;
        return {
          x: newX,
          y: context.position.y,
        };
      },
    }),
  },
  guards: {
    hasLanded: ({ context }) => {
      return context.position.y + DEMO_CONFIG.eggHeight / 2 >= context.groundY;
    },
    exitComplete: ({ context }) => {
      const elapsed = Date.now() - context.exitStartTime;
      return elapsed >= DEMO_CONFIG.exitDuration;
    },
  },
  delays: {
    hatchingPauseDuration: DEMO_CONFIG.hatchingPauseDuration,
    hatchedPauseDuration: DEMO_CONFIG.hatchedPauseDuration,
  },
}).createMachine({
  id: 'Egg-Land-Hatch-Exit',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - STAGE_PADDING.BOTTOM;

    const chickExitDirection =
      input.chickExitDirection ?? (Math.random() < 0.5 ? -1 : 1);

    return {
      eggRef: { current: null },
      id: input.id,
      position: input.startPosition,
      velocity: 0,
      rotation: 0,
      rotationDirection: input.rotationDirection ?? 1,
      chickExitDirection,
      canvasWidth,
      canvasHeight,
      groundY,
      exitStartTime: 0,
      exitStartX: 0,
      exitTargetX: 0,
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
        hatchingPauseDuration: 'Hatched',
      },
    },
    Hatched: {
      after: {
        hatchedPauseDuration: 'Exiting',
      },
    },
    Exiting: {
      entry: 'prepareForExit',
      on: {
        Update: [
          {
            guard: 'exitComplete',
            target: 'Done',
          },
          {
            actions: 'updateExitPosition',
          },
        ],
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export type EggLandHatchExitActorRef = ActorRefFrom<
  typeof eggLandHatchExitMachine
>;
