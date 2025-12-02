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
 * Chef-Catch-With-Points Orchestrator Machine
 *
 * Demonstrates full actor coordination with collision detection and visual feedback:
 * 1. Orchestrator spawns hen and chef actors
 * 2. Hen sends "Lay an egg" events (alternating white/gold)
 * 3. Orchestrator spawns egg actors dynamically
 * 4. Eggs send position updates to parent
 * 5. Orchestrator detects collisions with chef's pot
 * 6. On collision: notifies egg and chef, spawns points animation
 * 7. Orchestrator cleans up completed eggs and points
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
      eggCaughtPointsActorRefs: ActorRefFrom<typeof eggCaughtPointsMachine>[];
      potRimHitAreaColor: string;
      caughtEggIds: Set<string>;
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
        // Skip spawning points for black eggs (though not in this story)
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
    hitFlashDuration: 500, // Match chef catching duration
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
  /** @xstate-layout N4IgpgJg5mDOIC5QGEAWYBmBaZBDALgMapYDqAlviQAoD25AdvrFgPIBOxc+7Bt7AYgDKYfAAIuGOvgBK5ALYAJSjMwBtAAwBdRKAAOtWJXK0GukAA9EAJgAcAZgB096wE4AjLYAsrl69sArABsADQgAJ6I7tYAvjFhaJg4BMRklDT0TCwcXLA8fOyOAJIQADZgAtSluOGaOkggBkb4JmYNVggBGo5utkEa7gDsGn0aAf6hEYj2GoOO7vZBLraDw9YDrnEJ6Nh4RCQUVFh0jMxsnOh5vPj8jjIArgwMjFACADI1YrgMYmBQUHVzE1jKZzB0utZHK5BgEvHZrNEAoMvO4wpFOhogo5bLZ3F4grYNK43J5bFsQIldikDuljpkzjlLvkboUHk8XgIAKL-MTAlqmMT3PQQAiQQENPmtMGILAI9yOAIBRYaEaw7y4+xoxBBIKuRxeQaecZjUmK8mU5L7NJHE5Zc65Zm3NnPBivVSwUTi-SGEFtUAdWV9KFBaxBAJ42YzXGTdH2FEKgJuNVDRMBMnxCk7S2pQ4ZU7ZC7ca5Ox4u15exo+-l+yyIOFYmZeOHWBF2QZBdwBLUIFyQmF9VMdzsI+zmrN7HO020MwtXAp3UsctTuere5pS9p1+xOQbWRahgkwsarbsI7peMbeIKrGH2QleOIZhi0CBwcwWic0m30gsO4vsIEqw3f0ZW3Lxg1DcML0GKN3BjRBbD7a93FcVDFXbaJ3DHJJP2tPM7UZIt5xKcpAPXUFNwQBZHExJslSGWxfFcDQDW7OC9VcHwxhRFElQ0axBmwqkrVzOl83tJl-wXdlXTI31pU6cC4xYwJohY3xvG7OEnAvaCXHbdU+kfGIgA */
  id: 'Chef - Catch eggs with points',
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
