import Konva from 'konva';
import { assign, setup } from 'xstate';

import { EGG_DEMO } from '../../story-constants';

import type { Position } from '../../../types';

/**
 * Simplest Egg Machine - Idle State Only
 *
 * This is the most basic version demonstrating a stationary egg.
 * Perfect starting point for understanding the actor model.
 *
 * Features:
 * - Single Idle state
 * - No movement, no transitions
 * - Just displays the egg sprite at a fixed position
 *
 * Demonstrates:
 * - Basic state machine setup
 * - eggRef management for Konva integration
 * - Minimal context (just position and ref)
 */

// Configuration using shared constants
const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  defaultX: EGG_DEMO.centerX,
  defaultY: EGG_DEMO.centerY,
};

const eggIdleMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
    };
    output: {
      eggId: string;
    };
    context: {
      eggRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
    };
    events: { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> };
  },
  actions: {
    setEggRef: assign({
      eggRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
  },
}).createMachine({
  id: 'Egg-Idle',
  context: ({ input }) => ({
    eggRef: { current: null },
    id: input.id,
    position: input.startPosition || {
      x: DEMO_CONFIG.defaultX,
      y: DEMO_CONFIG.defaultY,
    },
  }),
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
  initial: 'Idle',
  states: {
    Idle: {
      // Egg stays in this state forever
      // No transitions, no actions, just idle
    },
  },
});

export default eggIdleMachine;
