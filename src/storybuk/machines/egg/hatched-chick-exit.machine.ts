import { setup, assign, type ActorRefFrom } from 'xstate';

import type { Direction, Position } from '../../../types';

/**
 * Hatched Chick Exit Demo
 *
 * Shows chick in shell transitioning to running chick and exiting:
 * - Waiting (chick in shell on ground)
 * - Hatched (brief pause showing chick standing)
 * - Exiting (chick runs off screen)
 * - Done
 *
 * This demonstrates the exit animation without jump.
 */

const DEMO_CONFIG = {
  chickWidth: 60,
  chickHeight: 60,
  hatchedPauseDuration: 500,
  exitDuration: 1000,
};

const hatchedChickExitMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
      chickExitDirection?: Direction['value'];
    };
    output: {
      eggId: string;
    };
    context: {
      eggRef: { current: null };
      id: string;
      position: Position;
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
      | { type: 'Start' }
      | { type: 'Update' };
  },
  actions: {
    setEggRef: assign({
      eggRef: (_, params: React.RefObject<any>) => params,
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
    exitComplete: ({ context }) => {
      const elapsed = Date.now() - context.exitStartTime;
      return elapsed >= DEMO_CONFIG.exitDuration;
    },
  },
  delays: {
    hatchedPauseDuration: DEMO_CONFIG.hatchedPauseDuration,
  },
}).createMachine({
  id: 'Hatched-Chick-Exit',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? 1920;
    const canvasHeight = input.canvasHeight ?? 1080;
    const groundY = canvasHeight - 50;
    const centerX = Math.floor(canvasWidth / 2);

    const chickExitDirection =
      input.chickExitDirection ?? (Math.random() < 0.5 ? -1 : 1);

    return {
      eggRef: { current: null },
      id: input.id,
      position: input.startPosition || {
        x: centerX,
        y: groundY - DEMO_CONFIG.chickHeight / 2,
      },
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
        Start: 'Hatched',
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

export default hatchedChickExitMachine;
export type HatchedChickExitActorRef = ActorRefFrom<
  typeof hatchedChickExitMachine
>;
