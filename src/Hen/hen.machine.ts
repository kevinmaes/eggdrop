import Konva from 'konva';
import { and, assign, sendParent, setup } from 'xstate';

import { getGameConfig } from '../GameLevel/gameConfig';
import { tweenActor } from '../tweenActor';
import { isImageRef, type Direction, type Position } from '../types';
import { getRandomNumber } from '../utils';

import type { PhenotypeValuesForIndividual } from '../geneticAlgorithm/phenotype';
import type { GameAssets } from '../types/assets';
import type { DoneActorEvent, OutputFrom } from 'xstate';

type Destination = 'offscreen-right' | 'offscreen-left';
function getDestinationAndPositions(
  gameConfig: ReturnType<typeof getGameConfig>
) {
  const destination: Destination =
    Math.random() > 0.5 ? 'offscreen-right' : 'offscreen-left';
  const initialPosition =
    destination === 'offscreen-right'
      ? {
          x: -1 * gameConfig.hen.width - gameConfig.stageDimensions.margin,
          y: gameConfig.hen.y,
        }
      : {
          x:
            gameConfig.stageDimensions.width +
            gameConfig.stageDimensions.margin,
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
      gameConfig: ReturnType<typeof getGameConfig>;
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
      gameConfig: ReturnType<typeof getGameConfig>;
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
        return context.position.x >= context.gameConfig.stageDimensions.width;
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
      const totalDistance = context.gameConfig.stageDimensions.width;
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
  /** @xstate-layout N4IgpgJg5mDOIC5QAkwDsDEBlMAXABABboBKYAZgNoAMAuoqAA4D2sAlrm82gyAB6IAjIIAcggHSiAbACZhAZgCcAFmoB2NQBoQATyFr5y8SJEBWeQeXzzU6jIC+97akwAFAIYBXWGHxR3ALZgNPRIICzsnNy8AgimWrpCJuLysiLy8jLKioKmIjJSjs7o4gDy5OSwAMYATmDoGHywuO64YOLu5G01ABQwuCTuaBDMAVgtNbgAImAANu46AJQYLmUV1XXoIbwRHFw8YbFy8uLqygWqpoJSpuoJeggqIsYiavHKpuaKatQiRSCrACyzAAbmw0FAMCM0O1wSDmABrdpA0HgqAIOHMKqtfYhbZhXZRA6gI6CFTGPK-V45eQmKTaB6CGQ-FLfT5WUxSWxmf4osEQjBgGo1Zg1cSMea4ciigLiPlojFoeHYol4ug7Vh7aKHRCvBlCahSZ6CTKZc4qZR03klYH8qDiAByzAI8x0aPwYCgkKaLTaHS6Qp6QzYARx3AAou52BDw16ADILNEAIU8FSFgKwy3lEMdzvwrvdnqg+KYmqJMUQMhk8XEBVSTMUBWolv1CBEUkUkjMb1+hqU8mtaHEtrR4lcdUY7hq7twzHzCw9XsazVa7U63T6eEGw1GgLYEAAKgB3epoGaurM21E58dgSfTiH4WfznSL4vqgll-YVhBVmt1qQGybFtEgQNRVApRs1FkKwREbBwnABK87THCcpxnOdXTfZdfTXANen6bcRgCPdDxPdBzwWS8hxHG80IfKAn0whci0oQRQlLSJvx1X95FEU4pA+MkqRkfJW3yGQUkAzljhkahTCyQdh2ve0EzdR8ixw1d-Q3OTqGo5SULUwsvRLcIv21EkhE5IwCjguS1BEOxhBEcTAMkZtBGUAxDHMAdEOze0pm4XwCw0pcfW09dAzqZoAEF8OMiE4rQWMoAM2igpCl8TPfDjzK4yz+CSDtxEUHJTEtQRqCZatlDciRquULyfI+DIlOCmF8EyjAzMJbirN-ORa2US1GwUtQskUMxW2uT5awyLkapED51A67KerY-L+qKo57iEBDiiHcZmEYRhIAwMhYE8II-ECYIP04rViWKhAMmeTJrlG0xxuZGRZsUE5UlEjIptyfJCgCkoTrOi7Ir9aKCK3IZiJhqZPBqMM0AzAyYfOiA+osl7YnelI5EEj5fsm1sLFsj4uWgrITSyNQlLxuGVwR-DNwGFHRjRjGsZxlZodnWGCfYjVCuJxBMg+8nvqp-7QIUztFGoM0+OmpyOyUpLGLSrSuY3W59JFod9fwNLCeln8NFm+R1Frey4Mmqtyr+KGhyuggEu6fBLcN+G8I3WLcD9oV9ZStKDJ9-AI5qAPE0fa3HoK56f3OSTbE+KsVu+dXFAdp3RMbV2qxkD3HEQtBmAgOBeBcKWM54gBaORW1bxQpHETlQbka522qxQlPKSpalPZvyx4vVQJUNRe8qnIKsNGR2q9wy0SngbXpNBSyesDt1FE7tWwU541FEH44O+ar2yUzLcxdZPGKLbfdsrahAbK1J8jNLkmTiR+uIDQXk+LVkAopDej9bz3gwi+N878Za-iNJ2I0uczTgUvvIcSa9e6l0NJNV4zZPZHU3jmS2b9Py2x4l5ag1AD6cnVkQ0+oEnInBNPPc4tInLnAfipcQnVQov0QdQlug1rjlV7uBRsVh5JklMEAzsoCLDyTEKvfyZChHdRUkgu2ytGQ3A4dkeS4CqqiTZmLfGeieIORAUaKsJCfi0gMZWYQtZPh8VVj9V4Vg9YiLSjYwaNxOy0kyCoKQoDbD0lAl3EankmQhOalkUhSFvZwF9vhJO6kDZeiCa9OQklfKGigu8OCrlQImnkmVTkVxK5GnyCPDeZB3BVGIBAfAMxoxY3ybEZQUgTiCUmlccCJoTD9NmjcCQ6sqyZEruYehntHBAA */
  id: 'Hen',
  context: (({ input }: any) => {
    const { destination, position, targetPosition } =
      getDestinationAndPositions(
        input.gameConfig as ReturnType<typeof getGameConfig>
      );

    return {
      gameConfig: input.gameConfig as ReturnType<typeof getGameConfig>,
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
  }) as any,
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
