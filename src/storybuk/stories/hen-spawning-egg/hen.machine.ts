import Konva from 'konva';
import { assign, sendParent, setup } from 'xstate';

import { tweenActor, type TweenConfig } from '../../../tweenActor';
import { isImageRef, type Direction, type Position } from '../../../types';

/**
 * Story Hen Machine - Demonstrates sendParent() Pattern with Tween Animation
 *
 * A simplified hen that moves back and forth using tweenActor, periodically laying eggs.
 * Instead of managing egg state internally, it sends a "Lay an egg" event
 * to its parent orchestrator using sendParent().
 *
 * This demonstrates the actor model pattern where:
 * - Child actors (hen) communicate with parent via sendParent()
 * - Parent orchestrator receives events and spawns new actors
 * - Clean separation of concerns between actors
 * - Smooth animation via tweenActor invocation
 */

const DEMO_CONFIG = {
  henWidth: 120,
  henHeight: 120,
  eggWidth: 30,
  baseTweenDurationSeconds: 3,
  speed: 0.5,
  movementRangePercent: 0.5,
  layingDelay: 500, // ms between egg laying (longer to show more walking)
  layingDuration: 500, // ms hen stays in laying state
};

type Destination = 'left-edge' | 'right-edge';

export const henMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
      canvasWidth: number;
      canvasHeight: number;
    };
    output: {
      henId: string;
    };
    context: {
      henRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
      targetPosition: Position;
      destination: Destination;
      canvasWidth: number;
      canvasHeight: number;
      leftEdge: number;
      rightEdge: number;
      currentTweenDirection: Direction['value'];
      movingDirection: Direction['label'];
      currentTweenDurationMS: number;
      currentTweenSpeed: number;
      currentTweenStartTime: number;
      eggsLaid: number;
    };
    events:
      | { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> }
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
    setHenRef: assign({
      henRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    pickNewTargetPosition: assign(({ context }) => {
      const targetPosition = { ...context.position };
      let newDestination = context.destination;

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
    // Send "Lay an egg" event to parent orchestrator
    notifyParentOfEggLaying: sendParent(({ context }) => ({
      type: 'Lay an egg',
      henId: context.id,
      henPosition: {
        x: context.position.x + DEMO_CONFIG.henWidth / 2,
        y: context.position.y + DEMO_CONFIG.henHeight - 20 + 15,
      },
      eggColor: 'white' as const,
    })),
    incrementEggsLaid: assign({
      eggsLaid: ({ context }) => context.eggsLaid + 1,
    }),
  },
  actors: {
    henMovingActor: tweenActor,
  },
  delays: {
    layingDelay: DEMO_CONFIG.layingDelay,
    layingDuration: DEMO_CONFIG.layingDuration,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAkwDsC0AhAhgYwGsBBNCAMQHsAnAFwAsBiAZTBoAI70AlMAMwG0ADAF1EoAA4VYASxrSKaMSAAeiAKwAWDQDoAbGoCcagEzGTp4wEYNAGhABPRJeMBfF3dSZchEuWr1tAEkIABswBgAFEJx7IVEkEEkZOQUlVQQrS21TQQNLAHZjfLVLAwNiu0cEDWttfN0DXOKADnyAZjU1Nw90bHxiUkpaOm0AWQoAN2k0KAYIBTBtaYmKAkXPPp9B-xHxqZmEZYo8HBS0OLilJNl5RQT0zOyDXWaX0vyDNrNKxCLBbME+WajUsajaoMszW6IA23gGfmGY0m01mYCoVGo2nE0RovGoAFttLD+r4hgE9ijDmgViczhcRFcpDdUvdEPVdNprPlQfUwcZdFYfgg2s9ss0NIJrII1PpmtZocStgiAgARBZsCkzBiXBLXM5pX6WLI5PKFYqlcpqIWQ-5aXK6B0vQyCMwK3pw0k7bRqtBgDXIrX8SzxCRM-WsjJG7LGXIFIolMoVByINr5f6SwTNGX5YrGEU6N1eEnbRE8fCcCBsFVwORoU63BjKWA0U6LHC8GhogAUlkEggAlAxFfCySMy3gK1Wa9N6wodaHkrcDQhxVkvoCc9KY-VbMnhRoDHUJeCNK0BeVXdC0BQIHAlMPPcNGYuWaB0hhLELPtlDM4TPkJTNVx3Bhd1i2VEZgjCZ9mTuN8nGcbRwUEL41AzZommMIUah0fRBF0TM1EKQD8kLTYRy9TUoBg8N4OqMFtBQgwD1eFCNDUZohXXbRmmMLRjFXTNuXwsiPRLVV1SomilwjDR8iFR52LMQp9FTOVgVE8DR20cdJ2rZsZ1oxIwxkujyh0PiCnFEVSg0B0uNPTk+JqAj6nKF43DcIA */
  id: 'Hen - Moving + Laying',
  context: ({ input }) => {
    const canvasWidth = input.canvasWidth;
    const movementRange = canvasWidth * DEMO_CONFIG.movementRangePercent;
    const leftEdge = (canvasWidth - movementRange) / 2;
    const rightEdge = leftEdge + movementRange - DEMO_CONFIG.henWidth;

    return {
      henRef: { current: null },
      id: input.id,
      position: input.startPosition,
      targetPosition: input.startPosition,
      destination: 'right-edge' as Destination,
      canvasWidth: input.canvasWidth,
      canvasHeight: input.canvasHeight,
      leftEdge,
      rightEdge,
      currentTweenSpeed: 0,
      currentTweenDurationMS: 0,
      currentTweenStartTime: 0,
      currentTweenDirection: 0,
      movingDirection: 'none',
      eggsLaid: 0,
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
      on: {
        Play: 'Wait Before Laying',
      },
    },
    'Wait Before Laying': {
      after: {
        layingDelay: 'Laying egg',
      },
    },
    'Laying egg': {
      tags: 'laying',
      entry: ['notifyParentOfEggLaying', 'incrementEggsLaid'],
      after: {
        layingDuration: 'Moving',
      },
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
        { target: 'Wait Before Laying' },
      ],
    },
    'Reached Destination': {
      after: {
        100: 'Wait Before Laying',
      },
    },
  },
});

export type HenActor = typeof henMachine;
