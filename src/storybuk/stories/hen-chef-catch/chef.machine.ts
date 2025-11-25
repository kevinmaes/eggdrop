import Konva from 'konva';
import { assign, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Stationary Chef Machine - With Catch Reaction
 *
 * A stationary chef that reacts when catching eggs.
 * Demonstrates:
 * - Responding to parent events (Catch)
 * - Temporary state transitions
 * - Visual feedback through state tags
 */

const DEMO_CONFIG = {
  catchingDuration: 300, // Brief catch reaction
};

export const chefMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
    };
    output: {
      chefId: string;
    };
    context: {
      chefRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      isCatching: boolean;
    };
    events:
      | { type: 'Set chefRef'; chefRef: React.RefObject<Konva.Image> }
      | { type: 'Catch'; eggColor: 'white' | 'gold' };
  },
  actions: {
    setChefRef: assign({
      chefRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    setIsCatching: assign({
      isCatching: true,
    }),
    clearIsCatching: assign({
      isCatching: false,
    }),
  },
  delays: {
    catchingDuration: DEMO_CONFIG.catchingDuration,
  },
}).createMachine({
  id: 'Chef-Stationary',
  context: ({ input }) => ({
    chefRef: { current: null },
    id: input.id,
    position: input.startPosition,
    isCatching: false,
  }),
  output: ({ context }) => ({
    chefId: context.id,
  }),
  on: {
    'Set chefRef': {
      actions: {
        type: 'setChefRef',
        params: ({ event }) => event.chefRef,
      },
    },
  },
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        Catch: {
          target: 'Catching',
          actions: 'setIsCatching',
        },
      },
    },
    Catching: {
      tags: 'catching',
      after: {
        catchingDuration: {
          target: 'Idle',
          actions: 'clearIsCatching',
        },
      },
    },
  },
});

export type ChefMachine = typeof chefMachine;
