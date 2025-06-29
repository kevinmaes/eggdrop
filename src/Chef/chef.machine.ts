import Konva from 'konva';
import { Animation } from 'konva/lib/Animation';
import { assign, fromPromise, raise, setup } from 'xstate';

import { getGameConfig } from '../GameLevel/gameConfig';
import { sounds } from '../sounds';

import type { EggColor } from '../Egg/egg.machine';
import type { Position, Direction } from '../types';
import type { GameAssets } from '../types/assets';

export const chefMachine = setup({
  types: {} as {
    input: {
      chefConfig: ReturnType<typeof getGameConfig>['chef'];
      chefAssets: GameAssets['chef'];
      position: Position;
      speed: number;
      speedLimit: number;
      acceleration: number;
      deceleration: number;
      minXPos: number;
      maxXPos: number;
    };
    context: {
      chefConfig: ReturnType<typeof getGameConfig>['chef'];
      chefRef: React.RefObject<Konva.Image> | { current: null };
      chefAssets: GameAssets['chef'];
      position: Position;
      speed: number;
      speedLimit: number;
      direction: Direction['value'];
      movingDirection: Direction['label'];
      lastMovingDirection: Direction['label'];
      acceleration: number;
      deceleration: number;
      minXPos: number;
      maxXPos: number;
      isCatchingEgg: boolean;
    };
    events:
      | { type: 'Set chefRef'; chefRef: React.RefObject<Konva.Image> }
      | { type: 'Catch'; eggColor: EggColor }
      | { type: 'Set direction'; direction: Direction['value'] }
      | { type: 'Reset isCatchingEgg' };
  },
  guards: {
    isDirectionChanging: (
      { context },
      params: { direction: Direction['value'] }
    ) => context.direction !== params.direction,
  },
  actions: {
    setChefRef: assign({
      chefRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    playCatchReaction: (
      _,
      params: {
        eggColor: EggColor;
      }
    ) => {
      console.log('playCatchReaction', params.eggColor);
      switch (params.eggColor) {
        case 'black':
          if (Math.random() > 0.5) {
            sounds.ohNo.play();
          } else {
            sounds.wsup.play();
          }
          break;
        case 'gold':
          sounds.yes.play();
          break;
        default:
      }
    },
    updateChefPosition: assign(({ context }) => {
      const {
        speed,
        speedLimit,
        position,
        direction,
        acceleration,
        deceleration,
        minXPos,
        maxXPos,
      } = context;
      let newSpeed = speed;
      let newXPos = position.x;

      // Handle stopping movement
      if (direction === 0) {
        if (speed > 0) {
          newSpeed = speed - deceleration;
          if (newSpeed < 0) {
            newSpeed = 0;
          }
        } else if (speed < 0) {
          newSpeed = speed + deceleration;
          if (newSpeed > 0) {
            newSpeed = 0;
          }
        }
      } else {
        if (direction) {
          newSpeed = speed + direction * acceleration;
        }
      }

      // Restrict the newSpeed to the speedLimit
      if (Math.abs(newSpeed) > speedLimit) {
        newSpeed = Math.sign(newSpeed) * speedLimit;
      }

      newXPos = context.position.x + newSpeed;

      // Constraint the newXPos to the minXPos and maxXPos
      // to be within the boundaries of the chef's movement
      if (newXPos < minXPos) {
        newXPos = minXPos;
        newSpeed = 0;
      } else if (newXPos > maxXPos) {
        newXPos = maxXPos;
        newSpeed = 0;
      }
      return {
        speed: newSpeed,
        position: { x: newXPos, y: position.y },
      };
    }),
    setDirectionProps: assign(
      ({ context }, params: { direction: Direction['value'] }) => {
        const { direction } = params;
        if (direction === context.direction) {
          return context;
        }
        const movingDirection: Direction['label'] =
          direction === 1 ? 'right' : direction === -1 ? 'left' : 'none';

        // Update the lastMovingDirection only When actually moving in a direction
        const lastMovingDirection =
          movingDirection !== 'none'
            ? movingDirection
            : context.lastMovingDirection;

        return {
          direction,
          movingDirection,
          lastMovingDirection,
        };
      }
    ),
    setIsCatchingEgg: assign({
      isCatchingEgg: true,
    }),
    resetIsCatchingEgg: assign({
      isCatchingEgg: false,
    }),
    scheduleResetIsCatchingEgg: raise(
      { type: 'Reset isCatchingEgg' },
      {
        delay: 300,
      }
    ),
  },
  actors: {
    movingChefBackAndForthActor: fromPromise<{ timeDiff: number }>(() => {
      let anim: Animation | null;
      return new Promise((resolve) => {
        anim = new Animation((frame) => {
          if (frame?.timeDiff) {
            resolve({ timeDiff: frame?.timeDiff });
            anim?.stop();
            anim = null;
          }
        });
        anim.start();
      });
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGEAWYBmBiAymALgAQDG6GASpgNoAMAuoqAA4D2sAlvuywHaMgAPRAFoATADYA7ADpxUgJziALOJoBGUQGZJapQBoQATxFTpazfM2iAHJfHmaNcQF9nBtJlwFCEdgCcwYi5eWgYkEFYOYL5woQQlGgBWaRpbNXS1RNSVawNjBEyZUSVJJTVbRNUaUXlJV3cyaQBZFgA3dh4oLAheMGkO1pYAaz6PDGa2jqgEAZZiAENo0ND+SM5uGNA4zWtpTSlRLXkneWtrRPO8xC1NWTVayUdbZRpJUXqQMYn2zqxkRdIK3Ca2i-DiYkSSlkkkU1nUThqiUkVwQEjUKW0TkSEgSZ0hHy+LR+XUosG87Fg-3wpCmAFEoFAgcw2OteGCTOJpNZxDtrCUkeJrKUUaJ0fY+ZJxMdqpIhdZXG4QDwWBA4PwxqsWaDYiJNFlpEpEpp0nZ7PdkUYTMlHkolPtEqctIkjQTGkSppqoht2QhhJpqgajSb9mbaijzKJpFo1KlKnJjlk6gqgA */
  id: 'Chef',
  initial: 'Moving',
  context: ({ input }) => ({
    chefConfig: input.chefConfig,
    chefRef: { current: null },
    chefAssets: input.chefAssets,
    position: input.position,
    speed: input.speed,
    speedLimit: input.speedLimit,
    direction: 0,
    movingDirection: 'none',
    lastMovingDirection: 'none',
    acceleration: input.acceleration,
    deceleration: input.deceleration,
    minXPos: input.minXPos,
    maxXPos: input.maxXPos,
    isCatchingEgg: false,
  }),
  on: {
    'Set chefRef': {
      actions: { type: 'setChefRef', params: ({ event }) => event.chefRef },
    },
    'Set direction': {
      guard: {
        type: 'isDirectionChanging',
        params: ({ event }) => ({ direction: event.direction }),
      },
      actions: {
        type: 'setDirectionProps',
        params: ({ event }) => ({ direction: event.direction }),
      },
    },
  },
  states: {
    Moving: {
      invoke: {
        src: 'movingChefBackAndForthActor',
        onDone: {
          target: 'Moving',
          reenter: true,
          actions: 'updateChefPosition',
        },
      },
      on: {
        Catch: {
          actions: [
            'setIsCatchingEgg',
            {
              type: 'playCatchReaction',
              params: ({ event }) => ({ eggColor: event.eggColor }),
            },
            'scheduleResetIsCatchingEgg',
          ],
        },
        'Reset isCatchingEgg': {
          actions: 'resetIsCatchingEgg',
        },
      },
    },
  },
});
