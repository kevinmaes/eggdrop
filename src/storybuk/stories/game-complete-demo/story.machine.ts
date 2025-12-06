import { type RefObject } from 'react';

import { nanoid } from 'nanoid';
import { assign, sendTo, setup, type ActorRefFrom } from 'xstate';

import { eggCaughtPointsMachine } from '../../../EggCaughtPoints/eggCaughtPoints.machine';

import { chefMachine } from './chef.machine';
import { eggMachine } from './egg.machine';
import { henMachine } from './hen.machine';

import type { EggColor } from '../../../Egg/egg.machine';
import type { Position } from '../../../types';
import type Konva from 'konva';

/**
 * Game Complete Demo Orchestrator Machine
 *
 * Demonstrates full game loop with all mechanics:
 * 1. Orchestrator spawns hen and autonomous chef actors
 * 2. Hen sends "Lay an egg" events (rotating white/gold/black)
 * 3. Orchestrator spawns egg actors dynamically
 * 4. Eggs send position updates to parent
 * 5. Orchestrator detects collisions with moving chef's pot
 * 6. On collision: notifies egg and chef, spawns points animation
 * 7. Missed eggs complete full lifecycle (land, hatch/splat, run off)
 * 8. Orchestrator cleans up completed eggs and points
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
      chefPotRimHitRef: RefObject<Konva.Ellipse | null> | null;
      eggActorRefs: ActorRefFrom<typeof eggMachine>[];
      eggCaughtPointsActorRefs: ActorRefFrom<typeof eggCaughtPointsMachine>[];
      potRimHitAreaColor: string;
      caughtEggIds: Set<string>;
    };
    events:
      | { type: 'Play' }
      | { type: 'Reset' }
      | {
          type: 'Set chefPotRimHitRef';
          chefPotRimHitRef: RefObject<Konva.Ellipse | null>;
        }
      | {
          type: 'Lay an egg';
          henId: string;
          henPosition: Position;
          eggColor: 'white' | 'gold' | 'black';
        }
      | {
          type: 'Egg position updated';
          eggId: string;
          position: Position;
          eggColor: 'white' | 'gold' | 'black';
        };
  },
  actions: {
    // Store the chef pot rim hit ref
    setChefPotRimHitRef: assign({
      chefPotRimHitRef: (_, params: RefObject<Konva.Ellipse | null>) => params,
    }),
    // Set hit area color to red
    setPotRimHitAreaColorToRed: assign({
      potRimHitAreaColor: 'red',
    }),
    // Reset hit area color to yellow
    resetPotRimHitAreaColor: assign({
      potRimHitAreaColor: 'yellow',
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
    // Spawn the autonomous chef actor
    spawnChef: assign({
      chefActorRef: ({ context, spawn }) => {
        const chefId = `chef-${nanoid(6)}`;
        return spawn(chefMachine, {
          systemId: chefId,
          input: {
            id: chefId,
            startPosition: context.chefStartPosition,
            canvasWidth: context.canvasWidth,
            canvasHeight: context.canvasHeight,
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
    // Send Play to the chef to start moving
    playChef: ({ context }) => {
      if (context.chefActorRef) {
        context.chefActorRef.send({ type: 'Play' });
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
            canvasWidth: context.canvasWidth,
            canvasHeight: context.canvasHeight,
            color: event.eggColor,
            hatchRate: 0.5,
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
    tellChefHeCaught: (
      { context },
      params: { eggColor: 'white' | 'gold' | 'black' }
    ) => {
      if (context.chefActorRef) {
        context.chefActorRef.send({
          type: 'Catch',
          eggColor: params.eggColor,
        });
      }
    },
    // Spawn points animation when egg is caught (and track egg ID to prevent duplicates)
    spawnEggCaughtPoints: assign({
      eggCaughtPointsActorRefs: (
        { context, spawn },
        params: {
          eggId: string;
          eggColor: EggColor;
          position: Position;
        }
      ) => {
        // Skip if already caught this egg
        if (context.caughtEggIds.has(params.eggId)) {
          return context.eggCaughtPointsActorRefs;
        }
        // Skip spawning points for black eggs
        if (params.eggColor === 'black') {
          return context.eggCaughtPointsActorRefs;
        }
        return [
          ...context.eggCaughtPointsActorRefs,
          spawn(eggCaughtPointsMachine, {
            input: {
              eggCaughtPointsId: nanoid(),
              eggColor: params.eggColor,
              position: params.position,
            },
          }),
        ];
      },
      caughtEggIds: (
        { context },
        params: { eggId: string; eggColor: EggColor; position: Position }
      ) => {
        const newSet = new Set(context.caughtEggIds);
        newSet.add(params.eggId);
        return newSet;
      },
    }),
    // Remove completed points actors
    removeEggCaughtPoints: assign({
      eggCaughtPointsActorRefs: ({ context }) =>
        context.eggCaughtPointsActorRefs.filter(
          (eggCaughtPointsActorRef) =>
            eggCaughtPointsActorRef.getSnapshot().status !== 'done'
        ),
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
      eggCaughtPointsActorRefs: [],
      potRimHitAreaColor: 'yellow',
      caughtEggIds: new Set(),
    }),
  },
  delays: {
    hitFlashDuration: 500,
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
  id: 'Game Complete Demo',
  context: ({ input }) => {
    // Chef starts center for autonomous movement
    const chefX = Math.floor(input.canvasWidth / 2 - 172); // Center - half chef width (344/2)
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
      eggCaughtPointsActorRefs: [],
      potRimHitAreaColor: 'yellow',
      caughtEggIds: new Set(),
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
          actions: ['playHen', 'playChef'],
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
            {
              type: 'spawnEggCaughtPoints',
              params: ({ event }) => ({
                eggId: event.eggId,
                eggColor: event.eggColor,
                position: event.position,
              }),
            },
          ],
        },
        Reset: {
          target: 'Idle',
          actions: ['stopAllActors', 'clearActorRefs'],
        },
      },
      // Clean up completed eggs and points
      always: [
        {
          actions: 'cleanupDoneEggs',
          guard: ({ context }) =>
            context.eggActorRefs.some(
              (ref) => ref.getSnapshot().status === 'done'
            ),
        },
        {
          actions: 'removeEggCaughtPoints',
          guard: ({ context }) =>
            context.eggCaughtPointsActorRefs.some(
              (ref) => ref.getSnapshot().status === 'done'
            ),
        },
      ],
    },
  },
});

export type StoryMachine = typeof storyMachine;
