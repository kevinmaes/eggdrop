import Konva from 'konva';
import { assign, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Hen Laying Falling Egg Machine
 *
 * Demonstrates a hen laying an egg that falls and spins off screen.
 * The hen cycles through states while an egg appears, falls, and rotates.
 *
 * Features:
 * - Idle state (forward-facing sprite)
 * - Egg-laying state (back-facing sprite showing backside of hen)
 * - Spawns egg at hen's position during laying
 * - Egg falls with gravity and rotates until off screen
 * - Returns to idle and resets
 *
 * Demonstrates:
 * - State-based object spawning
 * - Combined animation (hen states + egg physics)
 * - Physics simulation (falling + rotation)
 * - State cleanup and reset
 */

const DEMO_CONFIG = {
  henWidth: 120,
  henHeight: 120,
  eggWidth: 30,
  eggHeight: 30,
  // Hen position is top-left corner, so we need to offset to get to hen's center bottom
  // Hen width is 120, so center X is at +60
  // Hen height is 120, so bottom Y is at +120
  eggOffsetX: 60 - 15, // Center hen (60) minus half egg width (15) = 45
  eggOffsetY: 120 - 22, // Bottom of hen (120) minus 22 = 98
  eggFallSpeed: 3, // pixels per update
  eggRotationSpeed: 8, // degrees per update
  eggUpdateInterval: 16, // ms between updates (~60fps)
};

const henLayingFallingEggMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasHeight: number;
    };
    output: {
      henId: string;
    };
    context: {
      henRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      canvasHeight: number;
      eggPosition: Position | null;
      eggRotation: number;
      showEgg: boolean;
    };
    events:
      | { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> }
      | { type: 'Play' };
  },
  actions: {
    setHenRef: assign({
      henRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    spawnEgg: assign(({ context }) => ({
      eggPosition: {
        x: context.position.x + DEMO_CONFIG.eggOffsetX,
        y: context.position.y + DEMO_CONFIG.eggOffsetY,
      },
      eggRotation: 0,
      showEgg: true,
    })),
    updateEggPosition: assign(({ context }) => {
      if (!context.eggPosition) return {};
      return {
        eggPosition: {
          x: context.eggPosition.x,
          y: context.eggPosition.y + DEMO_CONFIG.eggFallSpeed,
        },
        eggRotation: context.eggRotation + DEMO_CONFIG.eggRotationSpeed,
      };
    }),
    hideEgg: assign({
      showEgg: false,
      eggPosition: null,
      eggRotation: 0,
    }),
  },
  guards: {
    eggOffScreen: ({ context }) => {
      if (!context.eggPosition) return false;
      return (
        context.eggPosition.y > context.canvasHeight + DEMO_CONFIG.eggHeight
      );
    },
  },
  delays: {
    eggUpdateInterval: DEMO_CONFIG.eggUpdateInterval,
  },
}).createMachine({
  id: 'Hen-Laying-Falling-Egg',
  context: ({ input }) => ({
    henRef: { current: null },
    id: input.id,
    position: input.startPosition,
    canvasHeight: input.canvasHeight,
    eggPosition: null,
    eggRotation: 0,
    showEgg: false,
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
      entry: 'hideEgg',
      on: {
        Play: 'Preparing to lay',
      },
    },
    'Preparing to lay': {
      after: {
        200: 'Laying egg',
      },
    },
    'Laying egg': {
      tags: 'laying',
      entry: 'spawnEgg',
      // Immediately transition to egg falling (keeps laying tag)
      always: 'Egg falling',
    },
    'Egg falling': {
      tags: 'laying',
      // Egg falls while hen stays in laying visual state
      after: {
        eggUpdateInterval: {
          target: 'Egg falling',
          reenter: true,
          actions: 'updateEggPosition',
          guard: ({ context }) =>
            !context.eggPosition ||
            context.eggPosition.y <=
              context.canvasHeight + DEMO_CONFIG.eggHeight,
        },
      },
      always: {
        target: 'Done laying',
        guard: 'eggOffScreen',
      },
    },
    'Done laying': {
      entry: 'hideEgg',
      always: 'Waiting',
    },
    Waiting: {
      after: {
        1500: 'Preparing to lay',
      },
    },
  },
});

export default henLayingFallingEggMachine;
