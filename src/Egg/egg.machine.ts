import Konva from 'konva';
import {
  setup,
  assign,
  sendParent,
  type OutputFrom,
  type DoneActorEvent,
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
  /** @xstate-layout N4IgpgJg5mDOIC5QFEpQMQAUCGBXWYABFNgLZgDaADALqKgAOA9rAJYAurTAdvSAB6IAjFQBMAFgB04gGziho0QHYAHEoDMSmeoA0IAJ7DRAX2N7UUSQEkIAGzDoAymHaEwaAEpgAZtTpIQZjZOHj5BBCF1KkkZAFYVFXEVRXVY0USVPUMEeWiNIVihIQ0VdQUhU3M0SQAxbFtbVm4MCB4wSVh2bHZ2i1r6xua-PiCOLl4A8Mi5SSolMWV1AE4loSWZJSzEcXUpJdiNmWVY5ZPYpUqQPrqGpowAOSZOb31CJm9CbG5WUm7xwlGIW4wwCgPGYWE6hmcwWGhWaw2WwQoli0QU4kKSyoiSoVHOsUu1wGd3Qj2er3en2+vyBAJYYx4FCE-kY9KBEIicyEkiW6nUijEqVxByRQhU3JkxUlSiUSyUohEckJ1RugwwAGFugBjAAWINZwXBk0Q51FEiUkiUqPWSzURwVJjMVxVxOa1m+rlVJP1gTZRtA4R23KoUJ2sR2uL5QiRmhklqEGLUoihcQVMmVli9bqsHsIWYwTJZvsNoWNOTKs1DqQjIbKSNRKlmonWqmKBQUSwz-Vubsc7AATthWFAda4ACJMADu3HQrW47SaADcmABrXounuWPuD4ejwgT6cIJdMLV-Rm0H1g0sBxBqbn83lKWQHRSypFJKSxE5FKgrW0JLt80kABBVwvkIYDmnsWc2kkY810kIlNxAsDuAgqCwCPbhl1PIE-EvP1rwEW8lHvZtNGfe03wMRBUnUSRkxUMRcTiMQNC7AAZL4IEgdACJLCYbwieI42xRJ+REENxGTGNeQYyU7VSJZRBDBNOO43jCxGQjBOIhBERozklikEMZHFWQ+RWHYuwACW1HUSX4TpunabBvB6fsAAooioABKdA+js9hdTufiGV08IVIlJjbWTLEtGSJE5ViGIzOSq0hDkNJbPsu5CAAKVwUgGBg+cOi6HpEOqIKQuaAqioYML2TLTL5gY38ziKJJCnEJKrVSlR0sKLLHSqSwaocurCuKyRpoYPKAFUSrnBdsNXddxtyqaGtmhrFoYLCcLPYEL1obSBI5J9uXiOUVjtK1NFFKgxUtDFIkSDZlk7J1Aq2qB6pmgAhJhcG4LU8oPGcVrgtaEN+4LJv+ubJGB0HwbqyHDpPY78LO0EdI5cpuWKMpmJkLEqHETZDJEF6n0KdQPrhb6xskCbeKcirXPcsAvNRPyAuq+zICa-09JUuZJFSBMyiiWUZDiPqUoVwarQykau0cBhbG6ThmnQTmXMkNyPM8ySBb6LWdfYPWoFFojAxkaIdifMyVGlO6ZFFDspda+JdmbBJ0x+6pkH4MZ9eh+CNsQ8Pbax3Dxlxosrwi2ioSlpJjPDEQkjxWJRXlblZFUMzRE+2Rg6dbgmB4+AAgsc7wo5ABaaNDOMhjjNUcRfyY3ZxHELsbHsJvmqEqn3z5GIJF-FTk17yJANdKAx7FyLw0kFRYl5I4Tg2Z7RCRcv6MG19+XDHEh5DzMV-dDg8xXteHdosQt53qEUSheYFBjcVZkHu7eKCthQEhvt2NUkhtxDhHOOKculU4cidksSQO8tAFHWGoA4XtDIYjjCcaShRKbFB3qUZeyFQJUnQlAUe+MLplklPRQOqgrT7DiKaQy0sGIFBSDFcmCp1DkMgROecj9NzPzThEAoUgHo4nFAoI+nD-6U3mCGKKqiUTqW4DxCAEjCZU0bMQ84kZSj7EyLg6eRxe69zYRIAoOUEZ3D0WWRKHcnxSyhKkJiaQKKCPARNPKc1nETyptICibsPa2hwdkbeKDEhpC-EUGUIkHG1SRjtOa+1gl6XEPsMJrsg7FE9klOSKxknu2xPaMBrMAnbSBiDMGEN4HZPCOsFKzEZQiHDHiX8JT6JlPyD+ZSFR-F-QBgwEC1Jjr7jaC04QOwpBO17hoCQ2gxBPUypITKBwdjLF-JlPxNTha6Loc3FqPctlMTUMk3uqIC4d1RDyNMaxZDJmUJrbWusnGnPHuLTQ8lyYFDlgkRm3tKaoPJr3FS+95jVOdJYMOEdV4-PXsINR0hB6vjFBiQe0ThBPgtFQOI8pv67C-HCvoIiwBzIQPEC0co4hRFtHyFRopziiRRGZTFCsCgXFMMYIAA */
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
