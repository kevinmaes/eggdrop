import Konva from 'konva';
import { assign, setup } from 'xstate';

import { tweenActor } from '../../../tweenActor';
import { isImageRef, type Direction, type Position } from '../../../types';
import { CHEF_DEMO, STORY_CANVAS } from '../../story-constants';

/**
 * Chef Machine - With Pauses and Direction Facing
 *
 * Chef moves back and forth with random pauses and faces the direction of movement.
 * This version combines pausing behavior with sprite flipping.
 */

const DEMO_CONFIG = {
  stageWidth: STORY_CANVAS.width,
  stageHeight: STORY_CANVAS.height,
  chefWidth: 344,
  chefHeight: 344,
  chefY: CHEF_DEMO.centerY,
  entranceDelayMS: 500,
  baseTweenDurationSeconds: 2,
  speed: 0.3,
  // Pause parameters
  minPauseDurationMS: 1000,
  maxPauseDurationMS: 2000,
  movementRangePercent: 0.5,
};

type Destination = 'left-edge' | 'right-edge';

const chefWithPausesMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
    };
    output: {
      chefId: string;
    };
    context: {
      chefRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      destination: Destination;
      position: Position;
      targetPosition: Position;
      currentTweenDirection: Direction['value'];
      movingDirection: Direction['label'];
      currentTween: Konva.Tween | null;
      currentTweenDurationMS: number;
      currentTweenSpeed: number;
      currentTweenStartTime: number;
      canvasWidth: number;
      canvasHeight: number;
      leftEdge: number;
      rightEdge: number;
    };
    events:
      | { type: 'Set chefRef'; chefRef: React.RefObject<Konva.Image> }
      | { type: 'Play' };
  },
  guards: {
    'has reached destination': ({ context }) => {
      if (context.destination === 'right-edge') {
        return context.position.x >= context.rightEdge;
      } else {
        return context.position.x <= context.leftEdge;
      }
    },
  },
  actions: {
    setChefRef: assign({
      chefRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    pickNewTargetPosition: assign(({ context }) => {
      const targetPosition = { ...context.position };
      const newDestination = context.destination;

      if (context.destination === 'right-edge') {
        targetPosition.x = context.rightEdge;
      } else {
        targetPosition.x = context.leftEdge;
      }

      return {
        targetPosition,
        destination: newDestination,
      };
    }),
    createTweenToTargetPosition: assign(({ context }) => {
      const { targetPosition, chefRef } = context;
      const xDistance = targetPosition.x - context.position.x;
      const direction: Direction['value'] = xDistance > 0 ? 1 : -1;
      const movingDirection: Direction['label'] =
        direction === 1 ? 'right' : 'left';

      const absoluteXDistance = Math.abs(xDistance);
      const totalDistance = context.canvasWidth;
      const relativeDistance = absoluteXDistance / totalDistance;

      const duration =
        DEMO_CONFIG.baseTweenDurationSeconds *
        (1 - relativeDistance * DEMO_CONFIG.speed);

      let tween: Konva.Tween | null = null;
      if (isImageRef(chefRef) && chefRef.current) {
        tween = new Konva.Tween({
          node: chefRef.current,
          duration: duration,
          x: targetPosition.x,
        });
        tween.play();
      }

      const totalSpeed = xDistance / duration;
      const speedPerFrame = totalSpeed / 240;

      return {
        currentTweenSpeed: speedPerFrame,
        currentTweenDurationMS: duration * 1000,
        currentTweenStartTime: new Date().getTime(),
        currentTweenDirection: direction,
        currentTween: tween,
        movingDirection: movingDirection,
      };
    }),
    updateToLastTweenPosition: assign({
      position: (_, params: Position) => params,
      currentTweenSpeed: 0,
    }),
    cleanupTween: assign({
      currentTweenSpeed: 0,
      currentTweenDirection: 0,
      currentTweenDurationMS: 0,
      currentTweenStartTime: 0,
      currentTween: null,
      movingDirection: 'none',
    }),
    flipDestination: assign({
      destination: ({ context }) =>
        context.destination === 'right-edge' ? 'left-edge' : 'right-edge',
    }),
  },
  actors: {
    tweenActor: tweenActor,
  },
  delays: {
    entranceDelay: DEMO_CONFIG.entranceDelayMS,
    pauseDuration: () => {
      return (
        Math.random() *
          (DEMO_CONFIG.maxPauseDurationMS - DEMO_CONFIG.minPauseDurationMS) +
        DEMO_CONFIG.minPauseDurationMS
      );
    },
  },
}).createMachine({
  id: 'Chef-With-Pauses',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? DEMO_CONFIG.stageWidth;
    const canvasHeight = input.canvasHeight ?? DEMO_CONFIG.stageHeight;

    const movementRange = canvasWidth * DEMO_CONFIG.movementRangePercent;
    const leftEdge = (canvasWidth - movementRange) / 2;
    const rightEdge = leftEdge + movementRange;

    // Use startPosition from input for initial position
    const position = input.startPosition;
    const destination: Destination = 'right-edge';

    return {
      chefRef: { current: null },
      id: input.id,
      destination,
      position,
      targetPosition: position,
      currentTweenDirection: 0,
      movingDirection: 'right',
      currentTween: null,
      currentTweenDurationMS: 0,
      currentTweenSpeed: 0,
      currentTweenStartTime: 0,
      canvasWidth,
      canvasHeight,
      leftEdge,
      rightEdge,
    };
  },
  on: {
    'Set chefRef': {
      actions: {
        type: 'setChefRef',
        params: ({ event }) => event.chefRef,
      },
    },
  },
  initial: 'Idle',
  states: {
    Idle: {
      on: { Play: 'Moving' },
    },
    Moving: {
      entry: ['pickNewTargetPosition', 'createTweenToTargetPosition'],
      exit: 'cleanupTween',
      invoke: {
        id: 'tweenActor',
        src: 'tweenActor',
        input: ({ context }) => ({
          node: isImageRef(context.chefRef) ? context.chefRef.current : null,
          tween: context.currentTween,
        }),
        onDone: {
          target: 'Done Moving',
          actions: {
            type: 'updateToLastTweenPosition',
            params: ({ event }) => event.output,
          },
        },
      },
    },
    'Done Moving': {
      always: [
        {
          guard: 'has reached destination',
          target: 'Reached Destination',
          actions: 'flipDestination',
        },
        {
          target: 'Moving',
        },
      ],
    },
    'Reached Destination': {
      // Pause at destination for 1-2 seconds before moving again
      after: {
        pauseDuration: 'Moving',
      },
    },
  },
  output: ({ context }) => ({
    chefId: context.id,
  }),
});

export default chefWithPausesMachine;
