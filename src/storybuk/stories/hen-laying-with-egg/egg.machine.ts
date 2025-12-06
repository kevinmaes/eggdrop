import Konva from 'konva';
import { assign, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Static Egg Machine - Spawned Actor
 *
 * A static egg that appears at the hen's position, stays visible for 2 seconds,
 * then disappears. This demonstrates a simple spawned actor lifecycle.
 *
 * This demonstrates:
 * - Actor lifecycle (spawned → visible → done)
 * - Timed state transitions
 * - Output on completion (returns eggId for parent cleanup)
 */

const DEMO_CONFIG = {
  eggWidth: 30,
  eggHeight: 30,
  visibleDuration: 2000, // ms egg stays visible
};

export const eggMachine = setup({
  types: {} as {
    input: {
      id: string;
      position: Position;
      color: 'white' | 'gold' | 'black';
    };
    output: {
      eggId: string;
    };
    context: {
      eggRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      color: 'white' | 'gold' | 'black';
    };
    events: { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> };
  },
  actions: {
    setEggRef: assign({
      eggRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
  },
  delays: {
    visibleDuration: DEMO_CONFIG.visibleDuration,
  },
}).createMachine({
  id: 'Static-Egg',
  context: ({ input }) => ({
    eggRef: { current: null },
    id: input.id,
    position: input.position,
    color: input.color,
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
  // Egg appears immediately when spawned
  initial: 'Visible',
  states: {
    Visible: {
      after: {
        visibleDuration: 'Done',
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export type EggActor = typeof eggMachine;
