import { setup } from 'xstate';

import { HEN_DEMO, STORY_CANVAS } from '../../story-constants';

import type { Position } from '../../../types';

/**
 * Headless Hen Machine - Idle State Only
 *
 * This is a headless version of hen-idle.machine.ts with all Konva dependencies removed.
 * It maintains the same state structure (single Idle state) but uses pure data.
 *
 * Purpose: Enable Stately Inspector integration for the simplest possible demo.
 */

// Configuration using shared constants
const DEMO_CONFIG = {
  henWidth: 120,
  henHeight: 120,
  defaultX: HEN_DEMO.centerX,
  defaultY: HEN_DEMO.centerY,
};

export const henIdleHeadlessMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
    };
    output: {
      henId: string;
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
  id: 'hen-idle-headless',
  context: ({ input }) => ({
    id: input.id,
    position: input.startPosition || {
      x: DEMO_CONFIG.defaultX,
      y: DEMO_CONFIG.defaultY,
    },
    canvasWidth: input.canvasWidth ?? STORY_CANVAS.width,
    canvasHeight: input.canvasHeight ?? STORY_CANVAS.height,
  }),
  output: ({ context }) => ({
    henId: context.id,
  }),
  initial: 'Ready',
  states: {
    Ready: {
      on: {
        Start: 'Idle',
      },
    },
    Idle: {
      // Hen stays in this state forever
      // No transitions, no actions, just idle
    },
  },
});
