import Konva from 'konva';
import { assign, setup } from 'xstate';

import { tweenActor, type TweenConfig } from '../../../tweenActor';
import { isImageRef } from '../../../types';

import type { Position } from '../../../types';

/**
 * Falling Egg Machine - Spawned Actor
 *
 * An egg that falls with tween-based animation when spawned by the parent orchestrator.
 * Falls off the bottom of the canvas and then completes.
 *
 * This demonstrates:
 * - Actor lifecycle (spawned → falling → done)
 * - Tween-based animation (no RAF loop)
 * - Output on completion (returns eggId for parent cleanup)
 */

const DEMO_CONFIG = {
  eggWidth: 30,
  eggHeight: 30,
  fallingDuration: 2, // Duration in seconds for the fall
};

export const eggMachine = setup({
  types: {} as {
    input: {
      id: string;
      position: Position;
      canvasHeight: number;
      rotationDirection?: 1 | -1;
      color: 'white' | 'gold' | 'black';
    };
    output: {
      eggId: string;
    };
    context: {
      eggRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      targetPosition: Position;
      canvasHeight: number;
      currentTweenDurationMS: number;
      color: 'white' | 'gold' | 'black';
    };
    events: { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> };
  },
  actors: {
    fallingTweenActor: tweenActor,
  },
  actions: {
    setEggRef: assign(({ context }, params: React.RefObject<Konva.Image>) => {
      // Set the node position immediately when ref is attached
      if (isImageRef(params)) {
        params.current.setPosition(context.position);
      }
      return { eggRef: params };
    }),
    setTweenProperties: assign({
      targetPosition: ({ context }) => ({
        x: context.position.x,
        y: context.canvasHeight + DEMO_CONFIG.eggHeight,
      }),
      currentTweenDurationMS: () => DEMO_CONFIG.fallingDuration * 1000,
    }),
    setFinalPosition: assign({
      position: (_, params: Position) => params,
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDECGAbdBLAdlAtAKJRQDEAymAC4AEYJASmAGYDaADALqKgAOA9rCxUs-HDxAAPRACYAjDIB07dgFYA7DIAc6uQE49AFj1aANCACeiLYcXrDc1avYA2Q-YDM7dVoC+v8zRMXAJiKEUg7DxSAFVeCFQqMA5uJBABIRExCWkEeSUNJx05dkcZVRcPcys8rXZFDzktCsaPF1VDG39AjCjQkgjekNj4xOS5VL5BYVFxNNz8xS0XZqLVEtUDdWrEDw91BpcmxpaKw1V-AJAcfgg4CUiQohIJDJns+cQ3BtV9mT05IYHNtLIh9HJFDJ1Ox9np1C4Vh4ZJVuiBHnhnuF0VBXtMsnNQLk5Aofn8AUC5CCalC9HYVN5-k0HL9UdjMYoACJiMC4zKzHKIQwIxSGGEyGTnNrqaFQnZ5Hwi1TiwweTqNQxQi6XIA */
  id: 'Falling-Egg',
  context: ({ input }) => ({
    eggRef: { current: null },
    id: input.id,
    position: input.position,
    targetPosition: input.position,
    canvasHeight: input.canvasHeight,
    currentTweenDurationMS: 0,
    color: input.color,
  }),
  output: ({ context }) => ({
    eggId: context.id,
  }),
  // Egg starts in Idle, transitions to Falling once eggRef is set
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        'Set eggRef': {
          target: 'Falling',
          actions: {
            type: 'setEggRef',
            params: ({ event }) => event.eggRef,
          },
        },
      },
    },
    Falling: {
      entry: 'setTweenProperties',
      invoke: {
        src: 'fallingTweenActor',
        input: ({ context }) => {
          if (!isImageRef(context.eggRef)) {
            throw new Error('Egg ref is not set');
          }

          const config: TweenConfig = {
            durationMS: context.currentTweenDurationMS,
            x: context.targetPosition.x,
            y: context.targetPosition.y,
            rotation: Math.random() > 0.5 ? 720 : -720,
          };

          return {
            node: context.eggRef.current,
            config,
          };
        },
        onDone: {
          target: 'Done',
          actions: {
            type: 'setFinalPosition',
            params: ({ event }) => event.output,
          },
        },
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export type EggActor = typeof eggMachine;
