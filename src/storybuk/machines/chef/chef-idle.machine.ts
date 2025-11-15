import Konva from 'konva';
import { assign, setup } from 'xstate';

import { CHEF_DEMO } from '../../story-constants';

import type { Position } from '../../../types';

/**
 * Simplest Chef Machine - Idle State Only
 *
 * Stationary chef displaying a single idle sprite.
 * Based on hen-idle pattern.
 */

const DEMO_CONFIG = {
  chefWidth: 100,
  chefHeight: 100,
  defaultX: CHEF_DEMO.centerX,
  defaultY: CHEF_DEMO.centerY,
};

const chefIdleMachine = setup({
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
    position: input.startPosition || {
      x: DEMO_CONFIG.defaultX,
      y: DEMO_CONFIG.defaultY,
    },
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

export default chefIdleMachine;
