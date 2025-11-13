import { setup } from 'xstate';

import { CHEF_DEMO, DEMO_CANVAS } from '../../demo-constants';

import type { Position } from '../../../types';

/**
 * Headless Chef Machine - Idle State Only
 *
 * Headless version for Stately Inspector integration.
 * Maintains same state structure as chef-idle.machine.ts but uses pure data.
 *
 * Purpose: Enable inspector integration for simplest chef demo.
 */

// Configuration using shared constants
const DEMO_CONFIG = {
  chefWidth: 120,
  chefHeight: 120,
  defaultX: CHEF_DEMO.centerX,
  defaultY: CHEF_DEMO.centerY,
};

const chefIdleHeadlessMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
    };
    output: {
      chefId: string;
    };
    context: {
      id: string;
      position: Position;
      canvasWidth: number;
      canvasHeight: number;
    };
    events: { type: 'Start' };
  },
}).createMachine({
  id: 'chef-idle-headless',
  context: ({ input }) => ({
    id: input.id,
    position: input.startPosition || {
      x: DEMO_CONFIG.defaultX,
      y: DEMO_CONFIG.defaultY,
    },
    canvasWidth: input.canvasWidth ?? DEMO_CANVAS.width,
    canvasHeight: input.canvasHeight ?? DEMO_CANVAS.height,
  }),
  output: ({ context }) => ({
    chefId: context.id,
  }),
  initial: 'Ready',
  states: {
    Ready: {
      on: {
        Start: 'Idle',
      },
    },
    Idle: {
      // Chef stays in this state forever
      // No transitions, no actions, just idle
    },
  },
});

export default chefIdleHeadlessMachine;
