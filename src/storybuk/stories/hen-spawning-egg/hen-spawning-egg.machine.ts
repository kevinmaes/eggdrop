import { nanoid } from 'nanoid';
import { assign, setup, type ActorRefFrom } from 'xstate';

import { storyEggMachine } from './story-egg.machine';
import { storyHenMachine } from './story-hen.machine';

import type { Position } from '../../../types';

/**
 * Hen-Egg Orchestrator Machine
 *
 * Demonstrates the actor model pattern for parent-child communication:
 *
 * 1. Orchestrator spawns hen as a child actor
 * 2. Hen sends "Lay an egg" events to parent (orchestrator) via sendParent()
 * 3. Orchestrator receives event and spawns egg actors dynamically
 * 4. Orchestrator tracks egg refs and cleans up when eggs complete
 *
 * This is the same pattern used in the real game's GameLevel machine,
 * simplified for educational demonstration.
 */

export const henSpawningEggMachine = setup({
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
      henActorRef: ActorRefFrom<typeof storyHenMachine> | null;
      eggActorRefs: ActorRefFrom<typeof storyEggMachine>[];
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
        return spawn(storyHenMachine, {
          systemId: henId,
          input: {
            id: henId,
            startPosition: context.henStartPosition,
            canvasWidth: context.canvasWidth,
            canvasHeight: context.canvasHeight,
          },
        });
      },
    }),
    // Send Play to the hen to start it moving
    playHen: ({ context }) => {
      if (context.henActorRef) {
        context.henActorRef.send({ type: 'Play' });
      }
    },
    // Spawn a new egg actor when hen lays
    spawnEgg: assign({
      eggActorRefs: ({ context, spawn, event }) => {
        if (event.type !== 'Lay an egg') return context.eggActorRefs;

        const eggId = `egg-${nanoid(6)}`;
        const newEgg = spawn(storyEggMachine, {
          systemId: eggId,
          input: {
            id: eggId,
            position: event.henPosition,
            canvasHeight: context.canvasHeight,
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
  context: ({ input }) => {
    // Use the position provided by story config (already calculated correctly)
    return {
      id: input.id,
      canvasWidth: input.canvasWidth,
      canvasHeight: input.canvasHeight,
      henStartPosition: input.startPosition,
      henActorRef: null,
      eggActorRefs: [],
    };
  },
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

export type HenSpawningEggMachine = typeof henSpawningEggMachine;
