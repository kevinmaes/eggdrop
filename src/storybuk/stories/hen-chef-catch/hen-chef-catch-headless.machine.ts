import { nanoid } from 'nanoid';
import { assign, setup } from 'xstate';

import type { Position } from '../../../types';

/**
 * Headless Hen-Chef-Catch Orchestrator Machine
 *
 * Headless version for XState Inspector integration.
 * Maintains the same state structure and event flow as the visual version
 * but without Konva dependencies.
 */

// Simplified actor stubs for headless mode
const createHeadlessHenMachine = () =>
  setup({
    types: {} as {
      input: { id: string; startPosition: Position };
      context: { id: string; position: Position };
      events: { type: 'Play' };
    },
  }).createMachine({
    id: 'headless-hen',
    context: ({ input }) => ({ id: input.id, position: input.startPosition }),
    initial: 'Idle',
    states: {
      Idle: { on: { Play: 'Running' } },
      Running: {},
    },
  });

const createHeadlessChefMachine = () =>
  setup({
    types: {} as {
      input: { id: string; startPosition: Position };
      context: { id: string; position: Position };
      events: { type: 'Catch' };
    },
  }).createMachine({
    id: 'headless-chef',
    context: ({ input }) => ({ id: input.id, position: input.startPosition }),
    initial: 'Idle',
    states: {
      Idle: {},
    },
  });

export const henChefCatchHeadlessMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth: number;
      canvasHeight: number;
    };
    context: {
      id: string;
      canvasWidth: number;
      canvasHeight: number;
      henStartPosition: Position;
      chefStartPosition: Position;
      henActorRef: unknown | null;
      chefActorRef: unknown | null;
    };
    events: { type: 'Play' } | { type: 'Reset' };
  },
  actions: {
    spawnHen: assign({
      henActorRef: ({ context, spawn }) => {
        const henId = `hen-${nanoid(6)}`;
        return spawn(createHeadlessHenMachine(), {
          systemId: henId,
          input: {
            id: henId,
            startPosition: context.henStartPosition,
          },
        });
      },
    }),
    spawnChef: assign({
      chefActorRef: ({ context, spawn }) => {
        const chefId = `chef-${nanoid(6)}`;
        return spawn(createHeadlessChefMachine(), {
          systemId: chefId,
          input: {
            id: chefId,
            startPosition: context.chefStartPosition,
          },
        });
      },
    }),
  },
}).createMachine({
  id: 'hen-chef-catch-headless',
  context: ({ input }) => {
    const chefX = Math.floor((input.canvasWidth - 344) / 2) + 172;
    const chefY = input.canvasHeight - 100 - 344;

    return {
      id: input.id,
      canvasWidth: input.canvasWidth,
      canvasHeight: input.canvasHeight,
      henStartPosition: input.startPosition,
      chefStartPosition: { x: chefX, y: chefY },
      henActorRef: null,
      chefActorRef: null,
    };
  },
  initial: 'Idle',
  states: {
    Idle: {
      entry: ['spawnHen', 'spawnChef'],
      on: {
        Play: 'Running',
      },
    },
    Running: {
      on: {
        Reset: 'Idle',
      },
    },
  },
});

export type HenChefCatchHeadlessMachine = typeof henChefCatchHeadlessMachine;
