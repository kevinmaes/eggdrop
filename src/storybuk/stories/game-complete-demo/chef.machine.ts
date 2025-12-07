import Konva from 'konva';
import { assign, setup } from 'xstate';

import { tweenActor, type TweenConfig } from '../../../tweenActor';
import { type Direction, type Position } from '../../../types';
import { CHEF_DEMO, STORY_CANVAS } from '../../story-constants';

/**
 * Chef Machine - Back and Forth Movement with Catch Support
 *
 * Based on chef-back-and-forth pattern with added catch detection support.
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
  movementRangePercent: 0.5,
};

type Destination = 'left-edge' | 'right-edge';

export const chefMachine = setup({
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
      chefRef: React.RefObject<Konva.Group | null> | { current: null };
      chefPotRimHitRef:
        | React.RefObject<Konva.Ellipse | null>
        | { current: null };
      isCatching: boolean;
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
      | { type: 'Set chefRef'; chefRef: React.RefObject<Konva.Group | null> }
      | {
          type: 'Set chefPotRimHitRef';
          chefPotRimHitRef: React.RefObject<Konva.Ellipse | null>;
        }
      | { type: 'Catch'; eggColor: 'white' | 'gold' | 'black' }
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
    isCatching: ({ context }) => context.isCatching,
  },
  actions: {
    setChefRef: assign({
      chefRef: (_, params: React.RefObject<Konva.Group | null>) => params,
    }),
    setChefPotRimHitRef: assign({
      chefPotRimHitRef: (_, params: React.RefObject<Konva.Ellipse | null>) =>
        params,
    }),
    setIsCatching: assign({ isCatching: true }),
    clearIsCatching: assign({ isCatching: false }),
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
}).createMachine({
  id: 'Chef - Game Complete Demo',
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
      chefPotRimHitRef: { current: null },
      isCatching: false,
      id: input.id,
      destination,
      position,
      targetPosition: position,
      currentTweenDirection: 0,
      movingDirection: 'none',
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
    'Set chefPotRimHitRef': {
      actions: {
        type: 'setChefPotRimHitRef',
        params: ({ event }) => event.chefPotRimHitRef,
      },
    },
    Catch: {
      actions: 'setIsCatching',
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
        id: 'tweenActor',
        src: 'tweenActor',
        input: ({ context }) => {
          if (!context.chefRef?.current) {
            throw new Error('Chef ref is not set');
          }

          const config: TweenConfig = {
            durationMS: context.currentTweenDurationMS,
            x: context.targetPosition.x,
            easing: 'EaseInOut',
          };

          return {
            node: context.chefRef.current,
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
      after: {
        300: {
          guard: 'isCatching',
          actions: 'clearIsCatching',
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
      after: {
        300: {
          guard: 'isCatching',
          actions: 'clearIsCatching',
        },
      },
    },
    'Reached Destination': {
      after: {
        100: 'Moving',
        300: {
          guard: 'isCatching',
          actions: 'clearIsCatching',
        },
      },
    },
  },
  output: ({ context }) => ({
    chefId: context.id,
  }),
});
