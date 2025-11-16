import { setup } from 'xstate';

import { EGG_DEMO } from '../../story-constants';

import type { Position } from '../../../types';

/**
 * Headless Egg Machine - Idle State Only
 *
 * This is a headless version of the idle egg machine for inspector integration.
 * It has the same structure as the visual version but is designed to work
 * with the Stately Inspector.
 *
 * Features:
 * - Single Idle state
 * - No movement, no transitions
 * - Inspector-friendly (no Konva refs)
 *
 * Demonstrates:
 * - Basic state machine setup
 * - Minimal context (just position and id)
 * - Headless actor pattern
 */

// Configuration using shared constants
const DEMO_CONFIG = {
  eggWidth: 60,
  eggHeight: 60,
  defaultX: EGG_DEMO.centerX,
  defaultY: EGG_DEMO.centerY,
};

const eggIdleHeadlessMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth: number;
      canvasHeight: number;
    };
    output: {
      eggId: string;
    };
    context: {
      id: string;
      position: Position;
      canvasWidth: number;
      canvasHeight: number;
    };
    events: never;
  },
}).createMachine({
  id: 'Egg-Idle-Headless',
  context: ({ input }) => ({
    id: input.id,
    position: input.startPosition || {
      x: DEMO_CONFIG.defaultX,
      y: DEMO_CONFIG.defaultY,
    },
    canvasWidth: input.canvasWidth,
    canvasHeight: input.canvasHeight,
  }),
  output: ({ context }) => ({
    eggId: context.id,
  }),
  initial: 'Idle',
  states: {
    Idle: {
      // Egg stays in this state forever
      // No transitions, no actions, just idle
    },
  },
});

export default eggIdleHeadlessMachine;
