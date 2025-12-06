import Konva from 'konva';
import { assign, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Simplest Chef Machine - Idle State Only
 *
 * Stationary chef displaying a single idle sprite.
 * Based on hen-idle pattern.
 */

export const chefIdleMachine = setup({
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
    };
    events: { type: 'Set chefRef'; chefRef: React.RefObject<Konva.Image> };
  },
  actions: {
    setChefRef: assign({
      chefRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
  },
}).createMachine({
  id: 'Chef-Idle',
  context: ({ input }) => ({
    chefRef: { current: null },
    id: input.id,
    position: input.startPosition,
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
    Idle: {},
  },
});
