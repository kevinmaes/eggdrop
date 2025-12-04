import Konva from 'konva';
import { assign, sendParent, setup } from 'xstate';

import { tweenActor, type TweenConfig } from '../../../tweenActor';
import type { Direction, Position } from '../../../types';

/**
 * Moving Hen Machine - Continuous Egg Laying While Moving
 *
 * A hen that moves back and forth across the top of the screen while continuously
 * laying eggs in 3-color rotation.
 * Demonstrates:
 * - Parallel states (moving + laying simultaneously)
 * - sendParent() for parent-child communication
 * - Continuous state loops
 * - 3-color egg rotation
 */

const DEMO_CONFIG = {
  henWidth: 120,
  henHeight: 120,
  layingDelay: 350, // 0.35 seconds between eggs for more frequent drops
  layingDuration: 500, // 500ms laying animation
  baseTweenDurationSeconds: 1.5, // Much faster movement
  speed: 0.6,
  movementRangePercent: 0.5, // Move across 50% of screen width (centered)
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
      henRef: React.RefObject<Konva.Group> | { current: null };
      id: string;
      destination: Destination;
      position: Position;
      targetPosition: Position;
      canvasWidth: number;
      canvasHeight: number;
      leftEdge: number;
      rightEdge: number;
      eggsLaid: number;
      currentTweenDirection: Direction['value'];
      movingDirection: Direction['label'];
      currentTweenDurationMS: number;
      currentTweenSpeed: number;
      currentTweenStartTime: number;
    };
    events:
      | { type: 'Set henRef'; henRef: React.RefObject<Konva.Group> }
      | { type: 'Update position during tween'; position: Position }
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
      henRef: (_, params: React.RefObject<Konva.Group>) => params,
    }),
    // Send "Lay an egg" event to parent orchestrator with 3-color rotation
    notifyParentOfEggLaying: sendParent(({ context }) => {
      // Rotate through white (0), gold (1), black (2)
      const eggColor =
        context.eggsLaid % 3 === 0
          ? 'white'
          : context.eggsLaid % 3 === 1
            ? 'gold'
            : 'black';

      return {
        type: 'Lay an egg',
        henId: context.id,
        henPosition: {
          // Egg center-point position (hen's horizontal center, butt Y position)
          x: context.position.x + DEMO_CONFIG.henWidth / 2,
          y: context.position.y + DEMO_CONFIG.henHeight - 20 + 15,
        },
        eggColor: eggColor as 'white' | 'gold' | 'black',
      };
    }),
    incrementEggsLaid: assign({
      eggsLaid: ({ context }) => context.eggsLaid + 1,
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
        movingDirection: movingDirection,
      };
    }),
    updateToLastTweenPosition: assign({
      position: (_, params: Position) => params,
      currentTweenSpeed: 0,
    }),
    updatePositionDuringTween: assign({
      position: (_, params: Position) => params,
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
    tweenActor: tweenActor,
  },
  delays: {
    layingDelay: DEMO_CONFIG.layingDelay,
    layingDuration: DEMO_CONFIG.layingDuration,
  },
}).createMachine({
  id: 'Hen-Game-Complete-Demo',
  context: ({ input }) => {
    const movementRange = input.canvasWidth * DEMO_CONFIG.movementRangePercent;
    // Shift range to the left: start at 15% from left edge instead of centering
    const leftEdge = input.canvasWidth * 0.15;
    const rightEdge = leftEdge + movementRange;

    const position = input.startPosition;
    const destination: Destination = 'right-edge';

    return {
      henRef: { current: null },
      id: input.id,
      destination,
      position,
      targetPosition: position,
      canvasWidth: input.canvasWidth,
      canvasHeight: input.canvasHeight,
      leftEdge,
      rightEdge,
      eggsLaid: 0,
      currentTweenDirection: 0,
      movingDirection: 'none',
      currentTweenDurationMS: 0,
      currentTweenSpeed: 0,
      currentTweenStartTime: 0,
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
        Play: 'Active',
      },
    },
    Active: {
      type: 'parallel',
      states: {
        // Movement state
        Movement: {
          initial: 'Moving',
          states: {
            Moving: {
              entry: ['pickNewTargetPosition', 'createTweenToTargetPosition'],
              invoke: {
                id: 'tweenActor',
                src: 'tweenActor',
                input: ({ context, self }) => {
                  if (!context.henRef?.current) {
                    throw new Error('Hen ref is not set');
                  }

                  const config: TweenConfig = {
                    durationMS: context.currentTweenDurationMS,
                    x: context.targetPosition.x,
                    easing: 'EaseInOut',
                    onUpdate: (position: Position) => {
                      // Update position during animation so eggs spawn at correct location
                      if (self.getSnapshot().status === 'active') {
                        self.send({
                          type: 'Update position during tween',
                          position,
                        });
                      }
                    },
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
              },
              on: {
                'Update position during tween': {
                  actions: {
                    type: 'updatePositionDuringTween',
                    params: ({ event }) => event.position,
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
              after: {
                100: 'Moving',
              },
            },
          },
        },
        // Egg laying state (runs independently)
        Laying: {
          initial: 'Waiting to lay',
          states: {
            'Waiting to lay': {
              after: {
                layingDelay: 'Laying egg',
              },
            },
            'Laying egg': {
              tags: 'laying',
              entry: ['notifyParentOfEggLaying', 'incrementEggsLaid'],
              after: {
                layingDuration: 'Waiting to lay', // Loop back
              },
            },
          },
        },
      },
    },
  },
});

export type HenMachine = typeof henMachine;
