import Konva from 'konva';
import {
  setup,
  assign,
  sendParent,
  type OutputFrom,
  type DoneActorEvent,
  type ActorRefFrom,
} from 'xstate';

import { getGameConfig } from '../GameLevel/gameConfig';
import { sounds } from '../sounds';
import { tweenActor } from '../tweenActor';
import { isImageRef, type Direction, type Position } from '../types';

import { eggMotionActor } from './eggMotionActor';

import type { GameAssets } from '../types/assets';

export type EggColor = 'white' | 'gold' | 'black';
export type EggResultStatus =
  | null
  | 'Hatched'
  | 'Broken'
  | 'Caught'
  | 'Offscreen';

export type EggDoneEvent = DoneActorEvent<OutputFrom<typeof eggMachine>>;
export type EggActorRef = ActorRefFrom<typeof eggMachine>;
export const eggMachine = setup({
  types: {} as {
    input: {
      gameConfig: ReturnType<typeof getGameConfig>;
      id: string;
      eggAssets: GameAssets['egg'];
      chickAssets: GameAssets['chick'];
      henId: string;
      henIsMoving: boolean;
      position: Position;
      henCurentTweenSpeed: number;
      color: EggColor;
      rotationDirection: Direction['value'];
      hatchRate: number;
    };
    output: {
      henId: string;
      eggId: string;
      eggColor: EggColor;
      resultStatus: EggResultStatus;
    };
    context: {
      gameConfig: ReturnType<typeof getGameConfig>;
      eggRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      henId: string;
      eggAssets: GameAssets['egg'];
      chickAssets: GameAssets['chick'];
      henIsMoving: boolean;
      initialPosition: Position;
      position: Position;
      targetPosition: Position;
      color: EggColor;
      henCurentTweenSpeed: number;
      rotationDirection: Direction['value'];
      exitingSpeed: number;
      resultStatus: EggResultStatus;
      gamePaused: boolean;
      hatchRate: number;
      currentTween: Konva.Tween | null;
      currentAnimation: Konva.Animation | null;
    };
    events:
      | {
          type: 'Set eggRef';
          eggRef: React.RefObject<Konva.Image>;
        }
      | { type: 'Land on floor' }
      | { type: 'Catch' }
      | { type: 'Finished exiting' }
      | { type: 'Resume game' }
      | { type: 'Pause game' }
      | { type: 'Notify of animation position'; position: Position };
  },
  actors: {
    staticFallingActor: tweenActor,
    movingFallingActor: eggMotionActor,
    chickExitingStageActor: tweenActor,
    hatchingAnimation: tweenActor,
  },
  guards: {
    isHenMoving: ({ context }) => context.henIsMoving,
    eggCanHatch: ({ context }) => {
      if (context.color === 'black') {
        return false;
      }
      if (context.color === 'gold') {
        return true;
      }
      return Math.random() < context.hatchRate;
    },
    isEggNearChefPot: ({ context }) => {
      if (!isImageRef(context.eggRef)) return false;
      return context.eggRef.current.y() >= context.gameConfig.chef.y;
    },
    isEggOffScreen: ({ context }) => {
      if (!isImageRef(context.eggRef)) return false;
      return (
        context.eggRef.current.x() < 0 ||
        context.eggRef.current.x() > context.gameConfig.stageDimensions.width
      );
    },
  },
  actions: {
    setEggRef: assign({
      eggRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
    pause: assign({
      gamePaused: true,
    }),
    setNewTargetPosition: assign({
      targetPosition: ({ context }) => ({
        x: context.position.x,
        y:
          context.gameConfig.stageDimensions.height -
          context.gameConfig.egg.brokenEgg.height -
          context.gameConfig.stageDimensions.margin,
      }),
    }),
    setTargetPositionToExit: assign({
      targetPosition: ({ context }) => ({
        x:
          context.position.x > context.gameConfig.stageDimensions.midX
            ? context.gameConfig.stageDimensions.width + 50
            : -50,
        y: context.position.y,
      }),
    }),
    setPositionToAnimationEndPostiion: assign({
      position: (_, params: Position) => params,
    }),
    notifyParentOfPosition: sendParent(
      ({ context }, params: { position: Position }) => ({
        type: 'Egg position updated',
        eggId: context.id,
        eggColor: context.color,
        position: params.position,
      })
    ),
    splatOnFloor: assign({
      position: ({ context }) => ({
        x: context.position.x - 0.5 * context.gameConfig.egg.brokenEgg.width,
        y:
          context.gameConfig.stageDimensions.height -
          context.gameConfig.egg.brokenEgg.height,
      }),
    }),
    hatchOnFloor: assign({
      position: ({ context }) => ({
        x: context.position.x,
        y:
          context.gameConfig.stageDimensions.height -
          context.gameConfig.egg.chick.height -
          context.gameConfig.stageDimensions.margin,
      }),
    }),
    setResultStatus: assign({
      resultStatus: (_, params: { resultStatus: EggResultStatus }) =>
        params.resultStatus,
    }),
    // Sounds
    playSplatSound: () => {
      sounds.splat.play();
    },
    playHatchSound: () => {
      sounds.hatch.play();
    },
    playHatchingChickSound: ({ context }) => {
      switch (context.color) {
        case 'gold':
          sounds.yipee.play();
          break;
        case 'white':
          sounds.haha.play();
          break;
        default:
      }
    },
  },
}).createMachine({
  id: 'Egg',
  initial: 'Idle',
  context: ({ input }) => {
    return {
      gameConfig: input.gameConfig,
      eggRef: { current: null },
      id: input.id,
      henId: input.henId,
      eggAssets: input.eggAssets,
      chickAssets: input.chickAssets,
      henIsMoving: input.henIsMoving,
      initialPosition: input.position,
      position: input.position,
      targetPosition: input.position,
      henCurentTweenSpeed: input.henCurentTweenSpeed,
      color: input.color,
      rotationDirection: input.rotationDirection,
      exitingSpeed: 10,
      resultStatus: null,
      gamePaused: false,
      hatchRate: input.hatchRate,
      currentTween: null,
      currentAnimation: null,
    };
  },
  output: ({ context }) => {
    return {
      henId: context.henId,
      eggId: context.id,
      eggColor: context.color,
      resultStatus: context.resultStatus,
    };
  },
  on: {
    'Pause game': {
      actions: 'pause',
    },
  },
  states: {
    Idle: {
      on: {
        'Set eggRef': {
          target: 'Falling',
          actions: {
            type: 'setEggRef',
            params: ({ event }) => event.eggRef,
          },
        },
      },
    },
    Falling: {
      tags: 'falling',
      on: {
        'Notify of animation position': [
          {
            guard: 'isEggOffScreen',
            target: 'Done',
            actions: {
              type: 'setResultStatus',
              params: { resultStatus: 'Offscreen' },
            },
          },
          {
            guard: 'isEggNearChefPot',
            actions: {
              type: 'notifyParentOfPosition',
              params: ({ event }) => ({
                position: event.position,
              }),
            },
          },
        ],
        Catch: {
          target: 'Done',
          actions: assign({
            resultStatus: 'Caught',
          }),
        },
      },
      initial: 'Init Falling',
      states: {
        'Init Falling': {
          always: [
            {
              guard: 'isHenMoving',
              target: 'At an Angle',
            },
            { target: 'Straight Down' },
          ],
        },
        'Straight Down': {
          entry: [
            'setNewTargetPosition',
            assign({
              currentTween: ({ context, self }) => {
                if (!isImageRef(context.eggRef)) return null;
                return new Konva.Tween({
                  node: context.eggRef.current,
                  duration: context.gameConfig.egg.fallingDuration,
                  x: context.targetPosition.x,
                  y: context.targetPosition.y,
                  rotation: Math.random() > 0.5 ? 720 : -720,
                  onUpdate: () => {
                    if (
                      self.getSnapshot().status === 'active' &&
                      isImageRef(context.eggRef)
                    ) {
                      self.send({
                        type: 'Notify of animation position',
                        position: {
                          x: context.eggRef.current.x(),
                          y: context.eggRef.current.y(),
                        },
                      });
                    }
                  },
                });
              },
            }),
          ],
          invoke: {
            src: 'staticFallingActor',
            input: ({ context }) => ({
              node: context.eggRef.current,
              tween: context.currentTween,
            }),
            onDone: {
              target: 'Done Falling',
              actions: {
                type: 'setPositionToAnimationEndPostiion',
                params: ({ event }) => event.output,
              },
            },
          },
        },
        'At an Angle': {
          invoke: {
            src: 'movingFallingActor',
            input: ({ context, self }) => ({
              parent: self,
              node: context.eggRef.current,
              initialPosition: context.initialPosition,
              xSpeed: context.henCurentTweenSpeed,
              ySpeed: context.gameConfig.egg.fallingSpeed,
              rotationDirection: context.rotationDirection,
              testForDestination: yPos =>
                yPos >=
                context.gameConfig.stageDimensions.height -
                  context.gameConfig.egg.brokenEgg.height -
                  context.gameConfig.stageDimensions.margin,
            }),
            onDone: {
              target: 'Done Falling',
              actions: {
                type: 'setPositionToAnimationEndPostiion',
                params: ({ event }) => event.output,
              },
            },
          },
        },
        'Done Falling': {
          type: 'final',
        },
      },
      onDone: 'Landed',
    },
    Landed: {
      always: [
        {
          guard: 'eggCanHatch',
          target: 'Hatching',
          actions: ['hatchOnFloor', 'playHatchSound'],
        },
        {
          target: 'Splatting',
          actions: ['splatOnFloor', 'playSplatSound'],
        },
      ],
    },
    Hatching: {
      after: {
        300: 'Hatching Jump',
      },
    },
    'Hatching Jump': {
      entry: 'playHatchingChickSound',
      initial: 'Jumping Up',
      states: {
        'Jumping Up': {
          invoke: {
            src: 'hatchingAnimation',
            input: ({ context }) => ({
              node: context.eggRef.current,
              tween: new Konva.Tween({
                node: context.eggRef.current!,
                duration: 0.4,
                x: context.position.x,
                y: context.position.y - 70,
                easing: Konva.Easings.EaseOut,
              }),
            }),
            onDone: 'Bouncing Down',
          },
        },
        'Bouncing Down': {
          invoke: {
            src: 'hatchingAnimation',
            input: ({ context }) => ({
              node: context.eggRef.current,
              tween: new Konva.Tween({
                node: context.eggRef.current!,
                y: context.eggRef.current!.y() + 70,
                duration: 0.4,
                easing: Konva.Easings.BounceEaseOut,
              }),
            }),
            onDone: 'Animation Done',
          },
        },
        'Animation Done': {
          type: 'final',
        },
      },
      onDone: 'Hatched',
    },
    Hatched: {
      entry: { type: 'setResultStatus', params: { resultStatus: 'Hatched' } },
      after: {
        500: 'Exiting',
      },
    },
    Splatting: {
      entry: { type: 'setResultStatus', params: { resultStatus: 'Broken' } },
      after: {
        1000: 'Done',
      },
    },
    Exiting: {
      tags: 'chick',
      entry: ['setTargetPositionToExit'],
      invoke: {
        src: 'chickExitingStageActor',
        input: ({ context }) => ({
          node: context.eggRef.current,
          tween: new Konva.Tween({
            node: context.eggRef.current!,
            duration: 1,
            x: context.targetPosition.x,
            y: context.targetPosition.y,
          }),
        }),
        onDone: 'Done',
      },
    },
    Done: {
      type: 'final',
    },
  },
});
