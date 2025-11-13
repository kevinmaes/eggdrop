import { assign, setup } from 'xstate';

import { CHEF_DEMO, DEMO_CANVAS } from '../../demo-constants';
import { tweenActorHeadless } from '../../tweenActorHeadless';

import type { Direction, Position } from '../../../types';
import type { DoneActorEvent, OutputFrom } from 'xstate';

/**
 * Headless Chef Machine - Back and Forth Movement
 *
 * Version with all Konva dependencies removed.
 * Maintains same state structure and logic but uses pure data for position updates.
 *
 * Purpose: Enable Stately Inspector integration without serialization issues.
 */

// Configuration using shared constants
const DEMO_CONFIG = {
  stageWidth: DEMO_CANVAS.width,
  stageHeight: DEMO_CANVAS.height,
  chefWidth: 120,
  chefHeight: 120,
  chefY: CHEF_DEMO.centerY,
  entranceDelayMS: 500,
  // Movement parameters
  baseTweenDurationSeconds: 3,
  speed: 0.5,
  // Movement range: 50% of canvas width, centered
  movementRangePercent: 0.5,
};

// Simplified destination type
type Destination = 'left-edge' | 'right-edge';

function getInitialState(canvasWidth: number) {
  // Calculate centered movement range (50% of canvas width)
  const movementRange = canvasWidth * DEMO_CONFIG.movementRangePercent;
  const leftEdge = (canvasWidth - movementRange) / 2;

  // Start from left side of range, move towards right
  const destination: Destination = 'right-edge';
  const initialPosition = {
    x: leftEdge,
    y: DEMO_CONFIG.chefY,
  };

  return {
    destination,
    position: initialPosition,
    targetPosition: initialPosition,
  };
}

const chefBackAndForthHeadlessMachine = setup({
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
      id: string;
      destination: Destination;
      position: Position;
      targetPosition: Position;
      currentTweenDirection: Direction['value'];
      movingDirection: Direction['label'];
      currentTween: any;
      currentTweenDurationMS: number;
      currentTweenSpeed: number;
      currentTweenStartTime: number;
      canvasWidth: number;
      canvasHeight: number;
      leftEdge: number;
      rightEdge: number;
    };
    events: { type: 'Start' };
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
      const { targetPosition } = context;
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

      const totalSpeed = xDistance / duration;
      const speedPerFrame = totalSpeed / 240;

      return {
        currentTweenSpeed: speedPerFrame,
        currentTweenDurationMS: duration * 1000,
        currentTweenStartTime: new Date().getTime(),
        currentTweenDirection: direction,
        currentTween: { duration, targetX: targetPosition.x },
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
      currentTween: null,
    }),
    pickOppositeDestination: assign(({ context }) => {
      const newDestination: Destination =
        context.destination === 'right-edge' ? 'left-edge' : 'right-edge';
      return {
        destination: newDestination,
      };
    }),
  },
  actors: {
    tweenActorHeadless: tweenActorHeadless,
  },
}).createMachine({
  id: 'chef-back-and-forth-headless',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth ?? DEMO_CONFIG.stageWidth;
    const canvasHeight = input.canvasHeight ?? DEMO_CONFIG.stageHeight;

    const movementRange = canvasWidth * DEMO_CONFIG.movementRangePercent;
    const leftEdge = (canvasWidth - movementRange) / 2;
    const rightEdge = leftEdge + movementRange;

    const { destination, position, targetPosition } =
      getInitialState(canvasWidth);

    return {
      id: input.id,
      destination,
      position,
      targetPosition,
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
  initial: 'Ready',
  states: {
    Ready: {
      on: {
        Start: 'Offscreen',
      },
    },
    Offscreen: {
      after: {
        [DEMO_CONFIG.entranceDelayMS]: {
          target: 'Moving',
        },
      },
    },
    Moving: {
      entry: ['pickNewTargetPosition', 'createTweenToTargetPosition'],
      invoke: {
        id: 'tweenActorHeadless',
        src: 'tweenActorHeadless',
        input: ({ context }) => ({
          currentTweenSpeed: context.currentTweenSpeed,
          currentTweenDurationMS: context.currentTweenDurationMS,
          currentTweenStartTime: context.currentTweenStartTime,
          tweenDirection: context.currentTweenDirection,
          targetPosition: context.targetPosition,
        }),
        onDone: {
          target: 'Done Moving',
          actions: assign({
            position: ({ event }) =>
              (event as DoneActorEvent<OutputFrom<typeof tweenActorHeadless>>)
                .output.lastPosition,
          }),
        },
      },
    },
    'Done Moving': {
      entry: ['cleanupTween'],
      always: [
        {
          guard: 'has reached destination',
          target: 'Reached Destination',
        },
        {
          target: 'Moving',
        },
      ],
    },
    'Reached Destination': {
      entry: ['pickOppositeDestination'],
      after: {
        1000: {
          target: 'Moving',
        },
      },
    },
  },
  output: ({ context }) => ({
    chefId: context.id,
  }),
});

export default chefBackAndForthHeadlessMachine;
