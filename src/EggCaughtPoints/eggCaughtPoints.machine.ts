import Konva from 'konva';
import { assign, setup, type OutputFrom } from 'xstate';

import { tweenActor } from '../tweenActor';
import { isImageRef, type Position } from '../types';

import type { EggColor } from '../Egg/egg.machine';

export type EggCaughtPointsDoneEvent = {
  output: OutputFrom<typeof eggCaughtPointsMachine>;
};

export const eggCaughtPointsMachine = setup({
  types: {} as {
    input: {
      eggCaughtPointsId: string;
      eggColor: EggColor;
      position: Position;
    };
    output: {
      eggCaughtPointsId: string;
    };
    context: {
      eggCaughtPointsId: string;
      eggColor: EggColor;
      position: Position;
      eggCaughtPointsRef: React.RefObject<Konva.Image> | { current: null };
    };
    events: {
      type: 'Set eggCaughtPointsRef';
      eggCaughtPointsRef: React.RefObject<Konva.Image>;
    };
  },
  actions: {
    setEggCaughtPointsRef: assign({
      eggCaughtPointsRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
  },
  actors: {
    tweenActor,
  },
}).createMachine({
  id: 'eggCaughtPoints',
  context: ({ input }) => ({
    eggCaughtPointsId: input.eggCaughtPointsId,
    eggColor: input.eggColor,
    position: input.position,
    eggCaughtPointsRef: { current: null },
  }),
  output: ({ context }) => ({
    eggCaughtPointsId: context.eggCaughtPointsId,
  }),
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        'Set eggCaughtPointsRef': {
          target: 'Animating',
          actions: {
            type: 'setEggCaughtPointsRef',
            params: ({ event }) => event.eggCaughtPointsRef,
          },
        },
      },
    },
    Animating: {
      invoke: {
        src: 'tweenActor',
        input: ({ context }) => {
          if (!isImageRef(context.eggCaughtPointsRef)) {
            throw new Error('eggCaughtPointsRef is not set');
          }
          const tween = new Konva.Tween({
            node: context.eggCaughtPointsRef.current,
            x: context.position.x,
            y: context.position.y - 120,
            opacity: 0,
            duration: 1.5,
            easing: Konva.Easings.EaseOut,
          });
          return {
            node: context.eggCaughtPointsRef.current,
            tween,
          };
        },
        onDone: 'Done',
      },
    },
    Done: {
      type: 'final',
    },
  },
});
