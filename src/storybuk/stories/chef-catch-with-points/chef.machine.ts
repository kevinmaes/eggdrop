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
      chefPotRimHitRef: React.RefObject<Konva.Ellipse> | { current: null };
      id: string;
      position: Position;
      isCatching: boolean;
    };
    events:
      | { type: 'Set chefRef'; chefRef: React.RefObject<Konva.Image> }
      | {
          type: 'Set chefPotRimHitRef';
          chefPotRimHitRef: React.RefObject<Konva.Ellipse>;
        }
      | { type: 'Catch'; eggColor: 'white' | 'gold' };
  },
  actions: {
    setChefRef: assign({
      chefRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    setChefPotRimHitRef: assign({
      chefPotRimHitRef: (_, params: React.RefObject<Konva.Ellipse>) => params,
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
  /** @xstate-layout N4IgpgJg5mDOIC5QGEAWYBmBaAygFwEM8BLAewDsCAnATwGIcw8ACAY3QwCVMBtABgC6iUAAdSsYiQrCQAD0QBGAOxKAdAFYAzAE4ATEoAcugCzbNB9XoA0IGor4A2VbssK3Jvkq0LNAX182aJi4hFKUtAxMbBwACqR4nMQAtgASktwY-EJIIGISYTLyCArGCs7GmkpuZp7qJuo2dsW6-oEcIURk4TSqAJIQADZgdMhE7FkyeZJdhYqa6qraCnzqBlWaCpbqxg6NiJoOC9oOFau6jgoGBtqtIEHY+J0U1D2jeOzE5FB0srChYKoCBg8GAqAAKVhjVCfKAAEQArlQnuQAJQjdqPMIvVRvD5fCY5KYFHJFHxHZardabbTbXa2RD6YyqJR8VnGAwU3S6Py3cikCBwGT3DpY2iTcTTaQkxBYBR7YprDSXLkmDnqRy6G4BO4Y0JdbH9Ibi-IzaUIYxKeWaPhlBQObRKXQOcyrDbGYy3YWY-W0HFQmHGyXkWYITSa1RGTSaYyrAx8eYVYxW+OqBz2x3OiwGN0e-y+IA */
  id: 'Chef-Stationary',
  context: ({ input }) => ({
    chefRef: { current: null },
    chefPotRimHitRef: { current: null },
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
    'Set chefPotRimHitRef': {
      actions: {
        type: 'setChefPotRimHitRef',
        params: ({ event }) => event.chefPotRimHitRef,
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
