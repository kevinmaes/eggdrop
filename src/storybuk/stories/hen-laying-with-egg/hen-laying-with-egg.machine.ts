import { nanoid } from 'nanoid';
import { assign, setup, type ActorRefFrom } from 'xstate';

import { eggMachine } from './egg.machine';
import { henMachine } from './hen.machine';

import type { Position } from '../../../types';

/**
 * Hen-Egg Orchestrator Machine (Static Egg Version)
 *
 * Demonstrates the actor model pattern with a stationary hen and static eggs:
 *
 * 1. Orchestrator spawns hen as a child actor
 * 2. Hen sends "Lay an egg" events to parent (orchestrator) via sendParent()
 * 3. Orchestrator receives event and spawns static egg actors
 * 4. Eggs appear for 2 seconds then complete (no falling physics)
 * 5. Orchestrator tracks egg refs and cleans up when eggs complete
 */

export const henLayingWithEggMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasHeight: number;
    };
    context: {
      id: string;
      canvasHeight: number;
      henStartPosition: Position;
      henActorRef: ActorRefFrom<typeof henMachine> | null;
      eggActorRefs: ActorRefFrom<typeof eggMachine>[];
    };
    events:
      | { type: 'Play' }
      | { type: 'Reset' }
      | {
          type: 'Lay an egg';
          henId: string;
          henPosition: Position;
          eggColor: 'white' | 'gold' | 'black';
        };
  },
  actions: {
    // Spawn the hen actor as a child (starts in Idle, facing forward)
    spawnHen: assign({
      henActorRef: ({ context, spawn }) => {
        const henId = `hen-${nanoid(6)}`;
        return spawn(henMachine, {
          systemId: henId,
          input: {
            id: henId,
            startPosition: context.henStartPosition,
            canvasHeight: context.canvasHeight,
          },
        });
      },
    }),
    // Send Play to the hen to start the laying cycle
    playHen: ({ context }) => {
      if (context.henActorRef) {
        context.henActorRef.send({ type: 'Play' });
      }
    },
    // Spawn a new static egg actor when hen lays
    spawnEgg: assign({
      eggActorRefs: ({ context, spawn, event }) => {
        if (event.type !== 'Lay an egg') return context.eggActorRefs;

        const eggId = `egg-${nanoid(6)}`;
        const newEgg = spawn(eggMachine, {
          systemId: eggId,
          input: {
            id: eggId,
            position: event.henPosition,
            color: event.eggColor,
          },
        });

        return [...context.eggActorRefs, newEgg];
      },
    }),
    // Remove completed egg actors
    cleanupDoneEggs: assign({
      eggActorRefs: ({ context }) => {
        return context.eggActorRefs.filter(
          (eggRef) => eggRef.getSnapshot().status !== 'done'
        );
      },
    }),
    // Stop all actors for reset
    stopAllActors: ({ context }) => {
      if (context.henActorRef) {
        context.henActorRef.stop();
      }
      for (const eggRef of context.eggActorRefs) {
        eggRef.stop();
      }
    },
    // Clear all actor refs
    clearActorRefs: assign({
      henActorRef: null,
      eggActorRefs: [],
    }),
  },
}).createMachine({
  id: 'Hen-Egg-Orchestrator',
  context: ({ input }) => ({
    id: input.id,
    canvasHeight: input.canvasHeight,
    henStartPosition: input.startPosition,
    henActorRef: null,
    eggActorRefs: [],
  }),
  initial: 'Idle',
  states: {
    Idle: {
      entry: 'spawnHen',
      on: {
        Play: {
          target: 'Running',
          actions: ['playHen'],
        },
      },
    },
    Running: {
      on: {
        // Receive "Lay an egg" from hen child via sendParent()
        'Lay an egg': {
          actions: 'spawnEgg',
        },
        Reset: {
          target: 'Idle',
          actions: ['stopAllActors', 'clearActorRefs'],
        },
      },
      // Clean up completed eggs
      always: {
        actions: 'cleanupDoneEggs',
        guard: ({ context }) =>
          context.eggActorRefs.some(
            (ref) => ref.getSnapshot().status === 'done'
          ),
      },
    },
  },
});

export type HenLayingWithEggMachine = typeof henLayingWithEggMachine;
