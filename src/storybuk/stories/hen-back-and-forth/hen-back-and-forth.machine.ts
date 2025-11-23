import Konva from 'konva';
import { assign, setup } from 'xstate';

import { tweenActor } from '../../../tweenActor';
import { isImageRef, type Direction, type Position } from '../../../types';
import { HEN_DEMO, STORY_CANVAS } from '../../story-constants';

/**
 * Simplified Hen Machine - Back and Forth Movement
 *
 * This is a stripped-down version of the production hen.machine.ts,
 * demonstrating only basic horizontal movement.
 *
 * REMOVED from production version:
 * - Egg-laying (all substates, guards, actions, sendParent events)
 * - Pause/resume functionality
 * - Stopped state
 * - Genetic algorithm phenotype (hardcoded values instead)
 * - GameConfig dependency (minimal hardcoded config)
 * - Egg counting
 * - Random stop durations
 *
 * KEPT from production version:
 * - State names: Idle, Moving, Done Moving, Reached Destination
 * - Action names: pickNewTargetPosition, createTweenToTargetPosition, etc.
 * - Tween actor invocation pattern
 * - Position management structure
 */

// Configuration using shared constants
const DEMO_CONFIG = {
  stageWidth: STORY_CANVAS.width,
  stageHeight: STORY_CANVAS.height,
  henWidth: 120,
  henHeight: 120,
  henY: HEN_DEMO.centerY,
  entranceDelayMS: 500,
  // Movement parameters (replaces phenotype)
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
    y: DEMO_CONFIG.henY,
  };

  return {
    destination,
    position: initialPosition,
    targetPosition: initialPosition,
  };
}

const henBackAndForthMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth?: number;
      canvasHeight?: number;
    };
    output: {
      henId: string;
    };
    context: {
      henRef: React.RefObject<Konva.Image> | { current: null };
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
      | { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> }
      | { type: 'Play' };
  },
  guards: {
    'has reached destination': ({ context }) => {
      // Check if we've reached the target edge
      if (context.destination === 'right-edge') {
        return context.position.x >= context.rightEdge;
      } else {
        return context.position.x <= context.leftEdge;
      }
    },
  },
  actions: {
    setHenRef: assign({
      henRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    pickNewTargetPosition: assign(({ context }) => {
      const targetPosition = { ...context.position };
      let newDestination = context.destination;

      // Alternate between left and right edges of the centered range
      if (context.destination === 'right-edge') {
        // We're moving right, so target is the right edge
        targetPosition.x = context.rightEdge;
      } else {
        // We're moving left, so target is the left edge
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

      // Calculate tween duration
      const absoluteXDistance = Math.abs(xDistance);
      const totalDistance = context.canvasWidth;
      const relativeDistance = absoluteXDistance / totalDistance;

      const duration =
        DEMO_CONFIG.baseTweenDurationSeconds *
        (1 - relativeDistance * DEMO_CONFIG.speed);

      const totalSpeed = xDistance / duration;
      const speedPerFrame = totalSpeed / 240;

      // Position hen at current location before starting tween
      if (!isImageRef(context.henRef)) {
        throw new Error('Hen ref is not set');
      }
      context.henRef.current.setPosition(context.position);

      const tween = new Konva.Tween({
        node: context.henRef.current,
        duration,
        x: targetPosition.x,
        y: targetPosition.y,
        easing: Konva.Easings.EaseInOut,
      });

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
    henMovingActor: tweenActor,
  },
  delays: {
    entranceDelay: DEMO_CONFIG.entranceDelayMS,
  },
}).createMachine({
  id: 'Hen-BackAndForth',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth || DEMO_CONFIG.stageWidth;
    const canvasHeight = input.canvasHeight || DEMO_CONFIG.stageHeight;

    // Calculate centered movement range (50% of canvas width)
    const movementRange = canvasWidth * DEMO_CONFIG.movementRangePercent;
    const leftEdge = (canvasWidth - movementRange) / 2;
    const rightEdge = leftEdge + movementRange - DEMO_CONFIG.henWidth;

    const { destination, position, targetPosition } =
      getInitialState(canvasWidth);

    return {
      henRef: { current: null },
      id: input.id,
      destination,
      position: input.startPosition || position,
      targetPosition,
      currentTweenSpeed: 0,
      currentTweenDurationMS: 0,
      currentTweenStartTime: 0,
      currentTweenDirection: 0,
      movingDirection: 'none',
      currentTween: null,
      canvasWidth,
      canvasHeight,
      leftEdge,
      rightEdge,
    };
  },
  output: ({ context }) => ({
    henId: context.id,
  }),
  on: {
    'Set henRef': {
      actions: {
        type: 'setHenRef',
        params: ({ event }) => event.henRef,
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
        src: 'henMovingActor',
        input: ({ context }) => ({
          node: context.henRef.current,
          tween: context.currentTween,
        }),
        onDone: {
          target: 'Done Moving',
          actions: {
            type: 'updateToLastTweenPosition',
            params: ({ event }) => event.output,
          },
        },
        onError: { target: 'Reached Destination' },
      },
    },
    'Done Moving': {
      always: [
        {
          guard: 'has reached destination',
          target: 'Reached Destination',
          actions: 'flipDestination',
        },
        { target: 'Moving' },
      ],
    },
    'Reached Destination': {
      // Instead of being final, loop back to Moving
      after: {
        100: 'Moving',
      },
    },
  },
});

export default henBackAndForthMachine;
