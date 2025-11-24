import Konva from 'konva';
import { assign, sendParent, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Hen Machine - Stationary Hen that Lays Eggs
 *
 * A stationary hen that cycles through laying eggs.
 * Uses sendParent() to notify the parent orchestrator when laying an egg.
 *
 * This demonstrates:
 * - Child actor using sendParent() to communicate with parent
 * - State-based animation (idle → preparing → laying → done)
 * - Timed state transitions
 */

const DEMO_CONFIG = {
  henWidth: 120,
  henHeight: 120,
  eggWidth: 30,
};

export const henMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasHeight: number;
    };
    output: {
      henId: string;
    };
    context: {
      henRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      canvasHeight: number;
    };
    events:
      | { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> }
      | { type: 'Play' };
  },
  actions: {
    setHenRef: assign({
      henRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    // Send "Lay an egg" event to parent orchestrator
    notifyParentOfEggLaying: sendParent(({ context }) => ({
      type: 'Lay an egg',
      henId: context.id,
      henPosition: {
        // Egg center-point position (hen's horizontal center, butt Y position)
        x: context.position.x + DEMO_CONFIG.henWidth / 2,
        y: context.position.y + DEMO_CONFIG.henHeight - 46,
      },
      eggColor: 'white' as const,
    })),
  },
}).createMachine({
  id: 'Hen-Laying',
  context: ({ input }) => ({
    henRef: { current: null },
    id: input.id,
    position: input.startPosition,
    canvasHeight: input.canvasHeight,
  }),
  output: ({ context }) => ({
    henId: context.id,
  }),
  on: {
    'Set henRef': {
      actions: {
        type: 'setHenRef',
        params: ({ event }) => event.henRef,
      },
    },
  },
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        Play: 'Preparing to lay',
      },
    },
    'Preparing to lay': {
      after: {
        200: 'Laying egg',
      },
    },
    'Laying egg': {
      tags: 'laying',
      entry: 'notifyParentOfEggLaying',
      after: {
        2000: 'Done laying',
      },
    },
    'Done laying': {
      always: 'Waiting',
    },
    Waiting: {
      after: {
        1500: 'Preparing to lay',
      },
    },
  },
});

export type HenActor = typeof henMachine;
