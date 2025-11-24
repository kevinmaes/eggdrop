import Konva from 'konva';
import { assign, sendParent, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Story Hen Machine - Demonstrates sendParent() Pattern
 *
 * A simplified hen that moves back and forth, periodically laying eggs.
 * Instead of managing egg state internally, it sends a "Lay an egg" event
 * to its parent orchestrator using sendParent().
 *
 * This demonstrates the actor model pattern where:
 * - Child actors (hen) communicate with parent via sendParent()
 * - Parent orchestrator receives events and spawns new actors
 * - Clean separation of concerns between actors
 */

const DEMO_CONFIG = {
  henWidth: 120,
  henHeight: 120,
  moveSpeed: 5, // Faster movement
  moveUpdateInterval: 16, // ~60fps
  layingDelay: 3000, // ms between egg laying (longer to show more walking)
  layingDuration: 500, // ms hen stays in laying state
};

export const storyHenMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth: number;
      canvasHeight: number;
    };
    output: {
      henId: string;
    };
    context: {
      henRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      canvasWidth: number;
      canvasHeight: number;
      direction: 1 | -1; // 1 = right, -1 = left
      eggsLaid: number;
    };
    events:
      | { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> }
      | { type: 'Play' }
      | { type: 'Update' };
  },
  actions: {
    setHenRef: assign({
      henRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    updatePosition: assign(({ context }) => {
      const newX =
        context.position.x + DEMO_CONFIG.moveSpeed * context.direction;
      const leftBound = 50;
      const rightBound = context.canvasWidth - DEMO_CONFIG.henWidth - 50;

      // Bounce at edges
      let newDirection = context.direction;
      let clampedX = newX;
      if (newX <= leftBound) {
        clampedX = leftBound;
        newDirection = 1;
      } else if (newX >= rightBound) {
        clampedX = rightBound;
        newDirection = -1;
      }

      return {
        position: { x: clampedX, y: context.position.y },
        direction: newDirection,
      };
    }),
    // Send "Lay an egg" event to parent orchestrator
    notifyParentOfEggLaying: sendParent(({ context }) => ({
      type: 'Lay an egg',
      henId: context.id,
      henPosition: {
        // Egg spawns at hen's center-bottom
        x: context.position.x + DEMO_CONFIG.henWidth / 2,
        y: context.position.y + DEMO_CONFIG.henHeight - 20,
      },
      eggColor: 'white' as const,
    })),
    incrementEggsLaid: assign({
      eggsLaid: ({ context }) => context.eggsLaid + 1,
    }),
  },
  guards: {
    // Could add guard to limit eggs laid
  },
  delays: {
    moveUpdateInterval: DEMO_CONFIG.moveUpdateInterval,
    layingDelay: DEMO_CONFIG.layingDelay,
    layingDuration: DEMO_CONFIG.layingDuration,
  },
}).createMachine({
  id: 'Story-Hen',
  context: ({ input }) => ({
    henRef: { current: null },
    id: input.id,
    position: input.startPosition,
    canvasWidth: input.canvasWidth,
    canvasHeight: input.canvasHeight,
    direction: 1,
    eggsLaid: 0,
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
      on: {
        Play: 'Moving',
      },
    },
    Moving: {
      on: {
        Update: {
          actions: 'updatePosition',
        },
      },
      after: {
        layingDelay: 'Laying egg',
      },
    },
    'Laying egg': {
      tags: 'laying',
      entry: ['notifyParentOfEggLaying', 'incrementEggsLaid'],
      after: {
        layingDuration: 'Moving',
      },
    },
  },
});

export type StoryHenActor = typeof storyHenMachine;
