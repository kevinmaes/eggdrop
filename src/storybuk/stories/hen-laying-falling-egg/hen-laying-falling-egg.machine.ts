import { nanoid } from 'nanoid';
import { assign, setup, type ActorRefFrom } from 'xstate';

import { eggMachine } from './egg.machine';
import { henMachine } from './hen.machine';

import type { Position } from '../../../types';

/**
 * Hen-Egg Orchestrator Machine (Falling Egg Version)
 *
 * Demonstrates the actor model pattern with a stationary hen and falling eggs:
 *
 * 1. Orchestrator spawns hen as a child actor
 * 2. Hen sends "Lay an egg" events to parent (orchestrator) via sendParent()
 * 3. Orchestrator receives event and spawns falling egg actors
 * 4. Eggs fall with gravity and rotation until off-screen
 * 5. Orchestrator tracks egg refs and cleans up when eggs complete
 */

export const henLayingFallingEggMachine = setup({
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
    // Spawn a new falling egg actor when hen lays
    spawnEgg: assign({
      eggActorRefs: ({ context, spawn, event }) => {
        if (event.type !== 'Lay an egg') return context.eggActorRefs;

        const eggId = `egg-${nanoid(6)}`;
        const newEgg = spawn(eggMachine, {
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
  /** @xstate-layout N4IgpgJg5mDOIC5QAkwDsC0BRKUMHkAnAYwAs4AXQgQwoHtCA6ASQgBswBiABTeoE8A2gAYAuolAAHOrACWFWXTQSQAD0QAOAKyMAjAE4ALMN2GATGa0A2MwHYNAGhD9E+3Y0Naj+s8I0bhYTMNKwBfUKdUTBw8IjJKGnomACUAVzQ0WTQoTgAZAQACajQCsFwRcSQQaTkFJRV1BDNdW0Z9W1MrfQBmLVstXqtHZ1d3T29ff0DgsIiQKOxcAhJyWCpaBkY0jKyc5LgwCgqVGvlFZSrG7qt3fX1tQ11hLT9fXScXBF0NfUZu+26gUM3XMd1sZnCkXQi1iKwSGxS6Uy2U4xyqpzqF1AjReZkYWjM7SePw05gJVg+iEefzshKe3QZNzMIPCczQdAgcBUCxiy3ia0SDBOMjO9UuiAwBlaII0thuwLcnm0lIQGE8jAeWgGgN0Ni0hn0kPm0N5cVW6ySLHYYGFtXODQlpl+Mrlpm6iq0ypGCH0wkYJmEPistnaRn83SNPKWZvhlu2yKgttFWLUiG6pI1wWMVmDwReIRVul03T+nm6utsfmEhnlrNCQA */
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

export type HenLayingFallingEggMachine = typeof henLayingFallingEggMachine;
