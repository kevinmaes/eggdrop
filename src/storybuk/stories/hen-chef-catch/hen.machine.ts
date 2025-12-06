import Konva from 'konva';
import { assign, sendParent, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Stationary Hen Machine - Continuous Egg Laying
 *
 * A stationary hen that continuously lays eggs, alternating between white and gold.
 * Demonstrates:
 * - sendParent() for parent-child communication
 * - Continuous state loops
 * - Dynamic egg color alternation
 */

const DEMO_CONFIG = {
  henWidth: 120,
  henHeight: 120,
  layingDelay: 800, // 0.8 seconds between eggs for demo visibility
  layingDuration: 500, // 500ms laying animation
};

export const henMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth: number;
      canvasHeight: number;
    };
    output: {
      henId: string;
    };
    context: {
      henRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      canvasWidth: number;
      canvasHeight: number;
      eggsLaid: number;
    };
    events:
      | { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> }
      | { type: 'Play' };
  },
  actions: {
    setHenRef: assign({
      henRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    // Send "Lay an egg" event to parent orchestrator with alternating colors
    notifyParentOfEggLaying: sendParent(({ context }) => {
      // Alternate between white (even) and gold (odd)
      const eggColor = context.eggsLaid % 2 === 0 ? 'white' : 'gold';

      return {
        type: 'Lay an egg',
        henId: context.id,
        henPosition: {
          // Egg center-point position (hen's horizontal center, butt Y position)
          x: context.position.x + DEMO_CONFIG.henWidth / 2,
          y: context.position.y + DEMO_CONFIG.henHeight - 20 + 15,
        },
        eggColor: eggColor as 'white' | 'gold',
      };
    }),
    incrementEggsLaid: assign({
      eggsLaid: ({ context }) => context.eggsLaid + 1,
    }),
  },
  delays: {
    layingDelay: DEMO_CONFIG.layingDelay,
    layingDuration: DEMO_CONFIG.layingDuration,
  },
}).createMachine({
  id: 'Hen-Stationary',
  context: ({ input }) => ({
    henRef: { current: null },
    id: input.id,
    position: input.startPosition,
    canvasWidth: input.canvasWidth,
    canvasHeight: input.canvasHeight,
    eggsLaid: 0,
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
        Play: 'Waiting to lay',
      },
    },
    'Waiting to lay': {
      after: {
        layingDelay: 'Laying egg',
      },
    },
    'Laying egg': {
      tags: 'laying',
      entry: ['notifyParentOfEggLaying', 'incrementEggsLaid'],
      after: {
        layingDuration: 'Waiting to lay', // Loop back
      },
    },
  },
});

export type HenMachine = typeof henMachine;
