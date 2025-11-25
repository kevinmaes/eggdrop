import { nanoid } from 'nanoid';
import { assign, sendTo, setup, type ActorRefFrom } from 'xstate';

import { CHEF_POT_OFFSET } from '../../story-config-constants';

import { chefMachine } from './chef.machine';
import { eggMachine } from './egg.machine';
import { henMachine } from './hen.machine';

import type { Position } from '../../../types';

/**
 * Hen-Chef-Catch Orchestrator Machine
 *
 * Demonstrates full actor coordination with collision detection:
 * 1. Orchestrator spawns hen and chef actors
 * 2. Hen sends "Lay an egg" events (alternating white/gold)
 * 3. Orchestrator spawns egg actors dynamically
 * 4. Eggs send position updates to parent
 * 5. Orchestrator detects collisions with chef's pot
 * 6. On collision: notifies egg and chef via sendTo()
 * 7. Orchestrator cleans up completed eggs
 */

export const henChefCatchMachine = setup({
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
      henActorRef: ActorRefFrom<typeof henMachine> | null;
      chefActorRef: ActorRefFrom<typeof chefMachine> | null;
      eggActorRefs: ActorRefFrom<typeof eggMachine>[];
    };
    events:
      | { type: 'Play' }
      | { type: 'Reset' }
      | {
          type: 'Lay an egg';
          henId: string;
          henPosition: Position;
          eggColor: 'white' | 'gold';
        }
      | {
          type: 'Egg position updated';
          eggId: string;
          position: Position;
          eggColor: 'white' | 'gold';
        };
  },
  actions: {
    // Spawn the hen actor
    spawnHen: assign({
      henActorRef: ({ context, spawn }) => {
        const henId = `hen-${nanoid(6)}`;
        return spawn(henMachine, {
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
    // Spawn the chef actor
    spawnChef: assign({
      chefActorRef: ({ context, spawn }) => {
        const chefId = `chef-${nanoid(6)}`;
        return spawn(chefMachine, {
          systemId: chefId,
          input: {
            id: chefId,
            startPosition: context.chefStartPosition,
          },
        });
      },
    }),
    // Send Play to the hen to start laying
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
    // Tell egg it was caught
    tellEggItWasCaught: sendTo(
      ({ system }, params: { eggId: string }) => system.get(params.eggId),
      { type: 'Catch' }
    ),
    // Tell chef it caught an egg
    tellChefHeCaught: sendTo(
      'chefMachine',
      (_, params: { eggColor: 'white' | 'gold' }) => ({
        type: 'Catch',
        eggColor: params.eggColor,
      })
    ),
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
      if (context.chefActorRef) {
        context.chefActorRef.stop();
      }
      for (const eggRef of context.eggActorRefs) {
        eggRef.stop();
      }
    },
    // Clear all actor refs
    clearActorRefs: assign({
      henActorRef: null,
      chefActorRef: null,
      eggActorRefs: [],
    }),
  },
  guards: {
    // Test collision between egg and chef's pot rim
    testPotRimHit: ({ context, event }) => {
      if (event.type !== 'Egg position updated') return false;

      const eggPos = event.position;
      // Pot center is at canvas center (since we positioned chef correctly)
      const potCenterX = context.canvasWidth / 2;
      // Pot rim Y uses offsetY from game config (negative value means above chef position)
      const potRimY = context.chefStartPosition.y + CHEF_POT_OFFSET.offsetY;

      // Check if egg center is within catch radius of pot rim
      const dx = eggPos.x - potCenterX;
      const dy = eggPos.y - potRimY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance < CHEF_POT_OFFSET.catchRadius;
    },
  },
}).createMachine({
  id: 'Hen-Chef-Catch-Orchestrator',
  context: ({ input }) => {
    // Calculate chef position at ground level
    // Center the pot (not the chef sprite) under the hen
    // Use CHEF_POT_OFFSET.centerX (172px) which is the distance from chef left edge to pot center
    const chefX = Math.floor(input.canvasWidth / 2 - CHEF_POT_OFFSET.centerX);
    const chefY = input.canvasHeight - 100 - 344; // Ground Y - chef height

    return {
      id: input.id,
      canvasWidth: input.canvasWidth,
      canvasHeight: input.canvasHeight,
      henStartPosition: input.startPosition,
      chefStartPosition: { x: chefX, y: chefY },
      henActorRef: null,
      chefActorRef: null,
      eggActorRefs: [],
    };
  },
  initial: 'Idle',
  states: {
    Idle: {
      entry: ['spawnHen', 'spawnChef'],
      on: {
        Play: {
          target: 'Running',
          actions: ['playHen'],
        },
      },
    },
    Running: {
      on: {
        // Receive "Lay an egg" from hen child
        'Lay an egg': {
          actions: 'spawnEgg',
        },
        // Receive position updates from eggs and check collision
        'Egg position updated': {
          guard: 'testPotRimHit',
          actions: [
            {
              type: 'tellEggItWasCaught',
              params: ({ event }) => ({ eggId: event.eggId }),
            },
            {
              type: 'tellChefHeCaught',
              params: ({ event }) => ({ eggColor: event.eggColor }),
            },
          ],
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

export type HenChefCatchMachine = typeof henChefCatchMachine;
