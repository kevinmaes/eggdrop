import Konva from 'konva';
import { assign, setup } from 'xstate';

import { tweenActor, type TweenConfig } from '../../../tweenActor';
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

export const henBackAndForthMachine = setup({
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

      return {
        currentTweenSpeed: speedPerFrame,
        currentTweenDurationMS: duration * 1000,
        currentTweenStartTime: new Date().getTime(),
        currentTweenDirection: direction,
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
  /** @xstate-layout N4IgpgJg5mDOIC5QAkwDsC0AhAhgYwGsBBNCAMQHsAnAFwAsBiAZTBoAI70AlMAMwG0ADAF1EoAA4VYASxrSKaMSAAeiAKwAWDQDoAbGoCcagEzGTp4wEYNAGhABPRJeMBfF3dSZchEuWr1tAEkIABswBgAFEJx7IVEkEEkZOQUlVQQrS21TQQNLAHZjfLVLAwNiu0cEDWttfN0DXOKADnyAZjU1Nw90bHxiUkpaOm0AWQoAN2k0KAYIBTBtaYmKAkXPPp9B-xHxqZmEZYo8HBS0OLilJNl5RQT0zOyDXWaX0vyDNrNKxCLBbME+WajUsajaoMszW6IA23gGfmGY0m01mYCoVGo2nE0RovGoAFttLD+r4hgE9ijDmgViczhcRFcpDdUvdEPVdNprPlQfUwcZdFYfgg2s9ss0NIJrII1PpmtZocStgiAgARBZsCkzBiXBLXM5pX6WLI5PKFYqlcpqIWQ-5aXK6B0vQyCMwK3pw0k7bRqtBgDXIrX8SzxCRM-WsjJG7LGXIFIolMoVByINr5f6SwTNGX5YrGEW6N1eEnbRE8fCcCBsFVwORoU63BjKWA0U6LHC8GhogAUlkEggAlAxFfCySMy3gK1Wa9N6wodaHkrcDQhxVkvoCc9KY-VbMnhRoDHUJeCNK0BeVXdC0BQIHAlMPPcNGYuWaB0hhLELPtlDM4TPkJTNVx3Bhd1i2VEZgjCZ9mTuN8nGcbRwUEL41AzZommMIUah0fRBF0TM1EKQD8kLTYRy9TUoBg8N4OqMFtBQgwD1eFCNDUZohXXbRmmMLRjFXTNuXwsiPRLVV1SomilwjDR8iFR52LMQp9FTOVgVE8DR20cdJ2rZsZ1oxIwxkujyh0PiCnFEVSg0B0uNPTk+JqAj6nKF43DcIA */
  id: 'Hen - Moving Back + Forth',
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
      invoke: {
        src: 'henMovingActor',
        input: ({ context }) => {
          if (!isImageRef(context.henRef)) {
            throw new Error('Hen ref is not set');
          }

          const config: TweenConfig = {
            durationMS: context.currentTweenDurationMS,
            x: context.targetPosition.x,
            y: context.targetPosition.y,
            easing: 'EaseInOut',
          };

          return {
            node: context.henRef.current,
            config,
          };
        },
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
