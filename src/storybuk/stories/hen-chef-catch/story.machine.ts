import { type RefObject } from 'react';

import { nanoid } from 'nanoid';
import { assign, sendTo, setup, type ActorRefFrom } from 'xstate';

import { chefMachine } from './chef.machine';
import { eggMachine } from './egg.machine';
import { henMachine } from './hen.machine';

import type { Position } from '../../../types';
import type Konva from 'konva';

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

function isEllipseRef(
  ref: unknown
): ref is RefObject<Konva.Ellipse> & { current: Konva.Ellipse } {
  return (
    ref !== null &&
    typeof ref === 'object' &&
    'current' in ref &&
    ref.current !== null
  );
}

export const storyMachine = setup({
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
      chefPotRimHitRef: RefObject<Konva.Ellipse> | null;
      eggActorRefs: ActorRefFrom<typeof eggMachine>[];
    };
    events:
      | { type: 'Play' }
      | { type: 'Reset' }
      | {
          type: 'Set chefPotRimHitRef';
          chefPotRimHitRef: RefObject<Konva.Ellipse>;
        }
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
    // Store the chef pot rim hit ref
    setChefPotRimHitRef: assign({
      chefPotRimHitRef: (_, params: RefObject<Konva.Ellipse>) => params,
    }),
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
    tellChefHeCaught: ({ context }, params: { eggColor: 'white' | 'gold' }) => {
      if (context.chefActorRef) {
        context.chefActorRef.send({
          type: 'Catch',
          eggColor: params.eggColor,
        });
      }
    },
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
      chefPotRimHitRef: null,
      eggActorRefs: [],
    }),
  },
  guards: {
    // Test collision between egg and chef's pot rim using actual hit box
    testPotRimHit: ({ context, event }) => {
      if (event.type !== 'Egg position updated') return false;
      if (!isEllipseRef(context.chefPotRimHitRef)) return false;

      const {
        x: potRimHitX,
        y: potRimHitY,
        width: potRimHitWidth,
        height: potRimHitHeight,
      } = context.chefPotRimHitRef.current.getClientRect();

      const eggPos = event.position;

      // Check if egg position is within pot rim hit box
      return (
        eggPos.x >= potRimHitX &&
        eggPos.x <= potRimHitX + potRimHitWidth &&
        eggPos.y >= potRimHitY &&
        eggPos.y <= potRimHitY + potRimHitHeight
      );
    },
  },
}).createMachine({
  id: 'Hen-Chef-Catch-Orchestrator',
  context: ({ input }) => {
    // Calculate chef position at ground level
    // Center the pot (not the chef sprite) under the hen
    const chefX = Math.floor(input.canvasWidth / 2 - 40);
    const chefY = input.canvasHeight - 100 - 344; // Ground Y - chef height

    return {
      id: input.id,
      canvasWidth: input.canvasWidth,
      canvasHeight: input.canvasHeight,
      henStartPosition: input.startPosition,
      chefStartPosition: { x: chefX, y: chefY },
      henActorRef: null,
      chefActorRef: null,
      chefPotRimHitRef: null,
      eggActorRefs: [],
    };
  },
  initial: 'Idle',
  on: {
    'Set chefPotRimHitRef': {
      actions: {
        type: 'setChefPotRimHitRef',
        params: ({ event }) => event.chefPotRimHitRef,
      },
    },
  },
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

export type StoryMachine = typeof storyMachine;
