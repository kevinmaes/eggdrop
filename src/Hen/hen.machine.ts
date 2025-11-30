import Konva from 'konva';
import { and, assign, sendParent, setup } from 'xstate';

import { type GameConfig } from '../gameConfig';
import { tweenActor } from '../tweenActor';
import { isImageRef, type Direction, type Position } from '../types';
import { getRandomNumber } from '../utils';

import type { PhenotypeValuesForIndividual } from '../geneticAlgorithm/phenotype';
import type { GameAssets } from '../types/assets';
import type { DoneActorEvent, OutputFrom } from 'xstate';

type Destination = 'offscreen-right' | 'offscreen-left';
function getDestinationAndPositions(gameConfig: GameConfig) {
  const destination: Destination =
    Math.random() > 0.5 ? 'offscreen-right' : 'offscreen-left';
  const initialPosition =
    destination === 'offscreen-right'
      ? {
          x: -1 * gameConfig.hen.width - gameConfig.stage.margin,
          y: gameConfig.hen.y,
        }
      : {
          x: gameConfig.stage.width + gameConfig.stage.margin,
          y: gameConfig.hen.y,
        };

  return {
    destination,
    position: initialPosition,
    targetPosition: initialPosition,
  };
}

export type HenDoneEvent = DoneActorEvent<OutputFrom<typeof henMachine>>;

export const henMachine = setup({
  types: {} as {
    input: {
      gameConfig: GameConfig;
      id: string;
      index: number;
      henAssets: GameAssets['hen'];
      position: Position;
      phenotype: PhenotypeValuesForIndividual;
    };
    output: {
      henId: string;
    };
    context: {
      gameConfig: GameConfig;
      henRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      index: number;
      henAssets: GameAssets['hen'];
      destination: 'offscreen-right' | 'offscreen-left';
      position: Position;
      targetPosition: Position;
      phenotype: PhenotypeValuesForIndividual;
      animationEasingEggLayingBufferMS: number;
      currentTweenSpeed: number;
      currentTweenDurationMS: number;
      currentTweenStartTime: number;
      currentTweenDirection: Direction['value'];
      movingDirection: Direction['label'];
      eggsLaid: number;
      currentTween: Konva.Tween | null;
      gamePaused: boolean;
    };
    events:
      | { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> }
      | { type: 'Stop moving' }
      | { type: 'Resume game' }
      | { type: 'Pause game' };
  },
  guards: {
    'has more eggs': ({ context }) =>
      context.phenotype.maxEggs < 0
        ? true
        : context.eggsLaid < context.phenotype.maxEggs,
    'is within stationary laying rate': ({ context }) =>
      Math.random() < context.phenotype.stationaryEggLayingRate,
    'is within moving laying rate': ({ context }) =>
      Math.random() < context.phenotype.movingEggLayingRate,
    'is not near animation end': ({ context }) => {
      const currentTime = new Date().getTime();
      const elapsedMS = currentTime - context.currentTweenStartTime;
      const remainingMS = context.currentTweenDurationMS - elapsedMS;
      return remainingMS > context.animationEasingEggLayingBufferMS;
    },
    'is within egg laying x bounds': ({ context }) => {
      const { position } = context;
      return (
        position.x >= context.gameConfig.hen.eggLayingXMin &&
        position.x <= context.gameConfig.hen.eggLayingXMax
      );
    },
    'can lay while stationary': and([
      'is within egg laying x bounds',
      'has more eggs',
      'is within stationary laying rate',
    ]),
    'can lay while moving': and([
      'is within egg laying x bounds',
      'has more eggs',
      'is within moving laying rate',
      'is not near animation end',
    ]),
    'has reached destination': ({ context }) => {
      if (context.destination === 'offscreen-right') {
        return context.position.x >= context.gameConfig.stage.width;
      } else if (context.destination === 'offscreen-left') {
        return context.position.x <= -1 * context.gameConfig.hen.width;
      }
      return false;
    },
  },
  actions: {
    setHenRef: assign({
      henRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    pause: assign({
      gamePaused: true,
    }),
    resume: assign({
      gamePaused: false,
    }),
    pickNewTargetPosition: assign(({ context }) => {
      const targetPosition = { ...context.position };
      const newPosition = { ...context.position };

      // Pick a new x target position within the hen motion range
      // and with a minimum distance from the current position
      // TODO a range could be a gene value.
      const minDistance = context.phenotype.minXMovement;
      const movementRange = context.phenotype.maxXMovement;

      if (context.destination === 'offscreen-right') {
        targetPosition.x =
          getRandomNumber(
            context.phenotype.minXMovement,
            context.phenotype.maxXMovement,
            true
          ) + context.position.x;
      } else if (context.destination === 'offscreen-left') {
        targetPosition.x =
          -Math.round(Math.random() * movementRange) +
          context.position.x -
          minDistance;
        targetPosition.x =
          context.position.x -
          getRandomNumber(
            context.phenotype.minXMovement,
            context.phenotype.maxXMovement,
            true
          );
      }

      return {
        position: newPosition,
        targetPosition,
      };
    }),
    createTweenToTargetPosition: assign(({ context }) => {
      const { targetPosition } = context;
      const totalDistance = context.gameConfig.stage.width;
      const xDistance = targetPosition.x - context.position.x;
      const direction: Direction['value'] = xDistance > 0 ? 1 : -1;
      const movingDirection: Direction['label'] =
        direction === 1 ? 'right' : 'left';

      // Calculate absolute distances for tween duration
      const absoluteXDistance = Math.abs(xDistance);
      const absoluteRelativeDistance = absoluteXDistance / totalDistance;

      const duration =
        context.phenotype.baseTweenDurationSeconds *
        (1 - absoluteRelativeDistance * context.phenotype.speed);

      // New calculation here...
      const totalSpeed = xDistance / duration;
      // TODO: Don't love this magic number 240
      const speedPerFrame = totalSpeed / 240;

      // Important! Make sure the hen node is positioned at the current context.position
      // before starting the tween
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
  },
  actors: {
    henMovingActor: tweenActor,
  },
  delays: {
    getRandomStartDelay: ({ context }) => {
      return context.gameConfig.hen.entranceDelayMS;
    },
    getRandomStopDurationMS: ({ context }) => {
      const { minStopMS, maxStopMS } = context.phenotype;
      // If values mutate to cross over, return the min value.
      if (minStopMS >= maxStopMS) return minStopMS;

      // Pick a value somewhere between the min and max stop duration.
      return Math.random() * (maxStopMS - minStopMS) + minStopMS;
    },
    restAfterLayingAnEgg: ({ context }) =>
      context.phenotype.restAfterLayingEggMS,
    animationEasingEggLayingBufferMS: ({ context }) =>
      context.animationEasingEggLayingBufferMS,
    getRandomMidTweenDelay: ({ context }) => {
      if (!context.currentTween) {
        throw new Error('No current tween');
      }
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - context.currentTweenStartTime;
      const remainingMS = Math.round(
        context.currentTweenDurationMS - elapsedTime
      );
      const remainingBufferedMS = Math.round(
        remainingMS - 2 * context.animationEasingEggLayingBufferMS
      );
      const delay = Math.round(
        Math.max(Math.random() * remainingBufferedMS, 0)
      );
      return delay;
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAkwDsDEBlMAXABABboBKYAZgNoAMAuoqAA4D2sAlrm82gyAB6IAtADYAHADoAjMOEAWAKzThAZmUAmNfIA0IAJ5C1ygJzi1R6pOqyzAdlWK1AX0c7UmAAoBDAK6ww+KE8AWzAaeiQQFnZObl4BBElZWXFhG2p04TUFeVFJSWUdfQRBWUkUxOo1SSNNI1k7eXlnV3RxAHlyclgAYwAnMHQMPlhcT1wwcU9ycd6AChhcEk80CGYgrFHe3AARMAAbT10ASgw3ds6e-vQw3iiOLh4I+LzJCSqbV+EjUTMfo0KhIkTKJRDZRLIvjZZJVwcJmiAzgBZZgANzYaCgGFWaAm6JRzAA1hMkaj0VAEHjmN0xg8wjcIncYo9QM8bMJ5FJ5EYZEZPmkagCECoyrJRF8vqU1F8jMp4SS0RiMGBer1mL1xIwDrhyGqguJ5WSKWh8dSmXS6LdWPdYk9EGzlOJ0o0qspqOCbEYbILBJIbOUqj8rJp0m65a1kQqoOIAHLMAgHXRk-BgKCY4ajcaTabK2bLNhBGncACinnYGKLqYAMocyQAhbydZWIrAnA0YmNx-AJpMpqD0phWplxRD5ZTCcTyaFg0TKKFj2eC6oO0SKHKNajKUXcpwuBHh0nt9z9RieXpJ3DMLuHZOpoYjMYTKYzeZ4JYrNaItgQAAqAHcBmguwJq2+6RuIR5gCeZ4YvgF5XroN59haDKDg8w4JI0HLyJu9oeiubpenoiC1BOkiKO6koKLIYZoOIEZkuBx6nuel4Johd4Zo+2ZzAsb6rEEn4-v+6BAYcIG0fRh5MdBUCwax169pQkjhAO0RobaCTKFyUgKGYXxSt8khqIKyiWOInqYTOwhurIRg0XRB5RtWiYwb2HEPlmz5qOk4kOWBzk9qm-aRKhNosiOHzUCkUrqK6Mr5AogryFk4iiNQMhihC1AfHCu5tlG2zcP43aube6YeU+Ob9CMACC3EBRiNVoBWUC+ZJBVFfBgVISpIVqWF-AjmooKpVpmSNLyYjsklKVpRlcjWTl9mFTi+DtRgwWMup4UYdYqXChYPKzjIgo2Io5kyBos4ehuOTLZ161Kb1W0Dc8mSOmR0hKOY5jaERCDJVF1CTmCmTUNywiSPZGzMIwjCQBgZCwN4IQBMEoTIap1rMoNCClBy3lZNkIOugU-0+iu4iupYHrQnIrrUXlrQw3DCPlZmlU8a+yz8Sz2zeL0hZoM2vks-DECbaFOPxAz4hbq8tnWNYuR-UU4KmKCYLSI01TA3ZTO0WLbP3hz3EvosPNrHzAtCyLpzMxerMS8plr9dLiCmVFvqmZk3wruo8iEUUsjqHLYKKOyYilBCTQG+IDWyS17mm8+8g+fbtEJ-gLWS276G5H6mRpYYdQaJO-z-UuqWriuaebqI3I2PZSMEHVMz4FnSfs1xz7VbgbfKgnTUtb5Lf4APvQdzWME55jfXY+hNh2FTWQLa8RjyCd-2bmUYLpNCorZaKUrOLuaDMBAcC8G4rsLxp3IpGkGRZI0uT5N6s4E+l0KBslk5kfZDoXQ+gAVvkODSeQ5DmVeFyIy1kyKqG9MNCQlRsjpCXtZScscWgSUcmA7auM8jpHEGCcwHwLIyjOkgoGS9XgugbkQxmOC-IMVjPGaeslez4NeiORIEhSHZWqGdShqsRy8hIVpM66U6hQjkPZdqjFILMRgnBNiXCUJ5wgTyOWRgN5yDdD8ScshFziIaFIiUsimF7lwf5DhiFuHuwSOKR01gN5GO+FYYx28PSOmBmCD4yhQQ8mwdYlh7YVrFTseorG4CdpkSlBOdKplRRildMDGaagUjmBXNrIRagm5xwiWtPBGi75xLShIGowM05CJkIkU6tkpAWChBuUERMoZxyNhABx6EyImDTsNXRaVLFjkFD8KQHxa5bkCekHczDO6ph6RpNKDp0rg3UBoNk1lhCCgUKlEONhDBBKmryZucBW7cSni5ROizSmxNxkvP0B9bJSg9L6ZKgpNB+mMDULk8DeSgisWcMgnhujEAgPgXYZYhZLLiZOB0uiyJiA9OYWwYzQ5ZDdPkwJ0INw7mcEAA */
  id: 'Hen',
  context: ({ input }) => {
    const { destination, position, targetPosition } =
      getDestinationAndPositions(input.gameConfig);

    return {
      gameConfig: input.gameConfig,
      henRef: { current: null },
      id: input.id,
      index: input.index,
      henAssets: input.henAssets,
      phenotype: input.phenotype,
      destination,
      position,
      targetPosition,
      animationEasingEggLayingBufferMS:
        input.gameConfig.hen.animationEasingEggLayingBufferMS,
      currentTweenSpeed: 0,
      currentTweenDurationMS: 0,
      currentTweenStartTime: 0,
      currentTweenDirection: 0,
      movingDirection: 'none',
      eggsLaid: 0,
      gamePaused: false,
      currentTween: null,
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
    'Pause game': {
      target: '.Stopped',
      actions: 'pause',
    },
  },
  initial: 'Offscreen',

  states: {
    Offscreen: {
      after: { getRandomStartDelay: 'Moving' },
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
        onError: { target: 'Stopped' },
      },
      initial: 'Not laying egg',
      states: {
        'Not laying egg': {
          after: {
            // Wait until after animation ease-in ramps up before laying an egg while moving.
            animationEasingEggLayingBufferMS: 'Preparing to lay egg',
          },
        },
        'Preparing to lay egg': {
          after: {
            getRandomMidTweenDelay: [
              { guard: 'can lay while moving', target: 'Laying egg' },
              { target: 'Not laying egg', reenter: true },
            ],
          },
        },
        'Laying egg': {
          entry: [
            sendParent(({ context }) => {
              if (!isImageRef(context.henRef)) {
                throw new Error('Hen ref is not set');
              }
              const randomEggColorNumber = Math.random();
              const eggColor =
                randomEggColorNumber < context.phenotype.blackEggRate
                  ? 'black'
                  : randomEggColorNumber < context.phenotype.goldEggRate
                    ? 'gold'
                    : 'white';

              return {
                type: 'Lay an egg',
                henId: context.id,
                henCurentTweenSpeed: context.currentTweenSpeed,
                henCurrentTweenDirection: context.currentTweenDirection,
                henPosition: context.henRef.current.getPosition(),
                eggColor,
                hatchRate: context.phenotype.hatchRate,
              };
            }),
            assign({
              eggsLaid: ({ context }) => context.eggsLaid + 1,
            }),
          ],
          after: {
            200: 'Done laying egg',
          },
        },
        'Done laying egg': {
          after: {
            restAfterLayingAnEgg: 'Not laying egg',
          },
        },
      },
    },
    'Done Moving': {
      always: [
        {
          guard: 'has reached destination',
          target: 'Reached Desination',
        },
        { target: 'Stopped' },
      ],
    },
    Stopped: {
      on: {
        'Resume game': {
          target: 'Moving',
          actions: 'resume',
        },
      },
      after: {
        getRandomStopDurationMS: [
          { guard: 'can lay while stationary', target: 'Laying Egg' },
          { target: 'Moving' },
        ],
      },
    },
    'Laying Egg': {
      tags: 'laying',
      entry: [
        sendParent(({ context }) => {
          if (!isImageRef(context.henRef)) {
            throw new Error('Hen ref is not set');
          }

          const randomEggColorNumber = Math.random();
          const eggColor =
            randomEggColorNumber < context.phenotype.blackEggRate
              ? 'black'
              : randomEggColorNumber < context.phenotype.goldEggRate
                ? 'gold'
                : 'white';

          return {
            type: 'Lay an egg',
            henId: context.id,
            henCurentTweenSpeed: context.currentTweenSpeed,
            henCurrentTweenDirection: context.currentTweenDirection,
            henPosition: context.henRef.current.getPosition(),
            eggColor,
            hatchRate: context.phenotype.hatchRate,
          };
        }),
        assign({
          eggsLaid: ({ context }) => context.eggsLaid + 1,
        }),
      ],
      after: { 500: 'Rest After Laying Egg' },
    },
    'Rest After Laying Egg': {
      after: { restAfterLayingAnEgg: 'Moving' },
    },
    'Reached Desination': {
      type: 'final',
    },
  },
});
