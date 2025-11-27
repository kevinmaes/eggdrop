/**
 * Egg Caught Points Demo Machine
 *
 * Demo version that responds to Play events and loops indefinitely.
 * Based on the main eggCaughtPointsMachine but simplified for story demos.
 */

import { assign, setup } from 'xstate';
import Konva from 'konva';

import type { Position } from '../../../types';
import type { EggColor } from '../../../Egg/egg.machine';

export const eggCaughtPointsDemoMachine = setup({
  types: {} as {
    input: {
      eggCaughtPointsId: string;
      eggColor: EggColor;
      position: Position;
    };
    context: {
      eggCaughtPointsId: string;
      eggColor: EggColor;
      position: Position;
      eggCaughtPointsRef: React.RefObject<Konva.Image> | { current: null };
    };
    events:
      | {
          type: 'Set eggCaughtPointsRef';
          eggCaughtPointsRef: React.RefObject<Konva.Image>;
        }
      | { type: 'Play' };
  },
  actions: {
    setEggCaughtPointsRef: assign({
      eggCaughtPointsRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
  },
}).createMachine({
  id: 'eggCaughtPointsDemo',
  context: ({ input }) => ({
    eggCaughtPointsId: input.eggCaughtPointsId,
    eggColor: input.eggColor,
    position: input.position,
    eggCaughtPointsRef: { current: null },
  }),
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        'Set eggCaughtPointsRef': {
          actions: {
            type: 'setEggCaughtPointsRef',
            params: ({ event }) => event.eggCaughtPointsRef,
          },
        },
        Play: 'Animating',
      },
    },
    Animating: {
      // This state is just a marker - the animation loop happens in the component
      // The component will continuously animate while in this state
    },
  },
});
