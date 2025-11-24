import Konva from 'konva';
import { assign, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Simplest Hen Machine - Idle State Only
 *
 * This is the most basic version demonstrating a stationary hen.
 * Perfect starting point for understanding the actor model.
 *
 * Features:
 * - Single Idle state
 * - No movement, no transitions
 * - Just displays the hen sprite at a fixed position
 *
 * Demonstrates:
 * - Basic state machine setup
 * - henRef management for Konva integration
 * - Minimal context (just position and ref)
 */

export const henIdleMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
    };
    output: {
      henId: string;
    };
    context: {
      henRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
    };
    events: { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> };
  },
  actions: {
    setHenRef: assign({
      henRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
  },
}).createMachine({
  id: 'Hen-Idle',
  context: ({ input }) => ({
    henRef: { current: null },
    id: input.id,
    position: input.startPosition,
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
      // Hen stays in this state forever
      // No transitions, no actions, just idle
    },
  },
});
