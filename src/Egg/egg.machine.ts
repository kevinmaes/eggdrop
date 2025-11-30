import Konva from 'konva';
import {
  setup,
  assign,
  sendParent,
  type OutputFrom,
  type DoneActorEvent,
  type ActorRefFrom,
} from 'xstate';

import { EGG_ROTATION } from '../constants';
import { type GameConfig } from '../gameConfig';
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
      gameConfig: GameConfig;
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
      gameConfig: GameConfig;
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
        context.eggRef.current.x() > context.gameConfig.stage.width
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
          context.gameConfig.stage.height -
          context.gameConfig.egg.brokenEgg.height -
          context.gameConfig.stage.margin,
      }),
    }),
    setTargetPositionToExit: assign({
      targetPosition: ({ context }) => ({
        x:
          context.position.x > context.gameConfig.stage.midX
            ? context.gameConfig.stage.width + 50
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
          context.gameConfig.stage.height -
          context.gameConfig.egg.brokenEgg.height,
      }),
    }),
    hatchOnFloor: assign({
      position: ({ context }) => ({
        x: context.position.x,
        y:
          context.gameConfig.stage.height -
          context.gameConfig.egg.chick.height -
          context.gameConfig.stage.margin,
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
  /** @xstate-layout N4IgpgJg5mDOIC5QFEpQMQAUCGBXWYABFNgLZgDaADALqKgAOA9rAJYAurTAdvSAB6IAjFQBMAFgB04gGziho0QHYAHEoDMSmeoA0IAJ7DRAX2N7UUSQEkIAGzDoAymHaEwaAEpgAZtTpIQZjZOHj5BBABWGUkATi0qcSUomJkVdRUVCL1DBFEIqkkFcXyIjRU8oQihU3M0SQAxbFtbVm4MCB4wSVh2bHYuiwamlra-PiCOLl4A8KVRdUkZKKUtUVSZVKFsxCUxRYjxUSERCJUY0RiakEHG5taMADkmTm99QiZvQmxuVlI+qcIExC3DGASBUzCwg0klEVAUIg0GkOmW2CCU8liIiO800CXUMiuN2G93QTxebw+Xx+f2BgJYkx4FCE-kY9OBkNyVAikgicVUSzhEXUiiyBkQZwKQnkVA2EVOMQUSkJdVuIwwAGE+gBjAAWoNZwQhM0QAFpFJI0uoYipDuIVAjDkpUUJNFIYuIZVRdgoZDL1MrLKr7tYfq4g210PrAmyjaBwuJ1EJJFR8QmDuoqCnE6jNNElFLTnN8UsjgSzNcVcS2iGOIRwxgmSzo4bQsaEAmkym5Op05n1NmxZEqCpkxcZKohPmqhcA0M7tXHOwAE7YVhQHWuAAiTAA7tx0B1uF1WgA3JgAawGlfnlkXK7XG8I273CFPTC1-0ZtCj4NbcfF+aSMKMSuksMiKEoMSonaUhyomIgxIhGQqLO9aSAAgq43yEOhbT2AenSSG+l6SESN4YVh3A4XhYCvtwZ4fsCfg-jGf4CABSbAaBUQQVBg49gs8wqGImYCso-rloMAAy3wQJAka0OMrHTP+CCpDEQFLDa5QXHCMhbIOmQFAcywJnMQhxGWtSWDJ3ByRAkbMkpLYqexakxNyVSieIxTpLIuiDiIeypOI7r5im8gSdZkgABLajqJL8D0fRdNg3j9EuAAUGZUAAlOggxxewur3CxLkcscoWaaIaS7PkCQpKiGTcuU7rKAcIGlEqkl1EVJVtIQABSuCkAwBFHt0vT9KRvXxfcQ0jQwZUMq54RSgmQFxBcQrpokKjOh6UiwuBMpVKcQipLOfUJQNw2jZId0MPNACqY2Hse9EXleljXfNj0PYtL0MHRDGfiC36KWCykVekI4bNow7HDV-YGTkWKCWkmZwpmComD1P1zbdi2SAAQkwuDcFq83Pvu71EZ9JGFYTUALfdZMU1TA00yD75g8xkMGitMMZIsGwZvaCiWqjRiVBaGyhaczWK1d8XyUlU2pelYBZfV+VM8VOqQMt7JtlKwqSLs5zKOcchpOIzrgdyeJiCI6jyHas6OAwth9JwEbqylkhpRlmVBXlBV1F7PvsH7UDG7GblzAUazCmsWhzEcAVo2OsSISISweeOWizsg-CTBGdPEd9pFl7HPOMVM-NNr+q2IPDPKlDlKQpui+2BaUUg2pBHm+VUGimOW3BMHJ8ABBYzlC22Jr5zCQoxFQuMKBvTqBeBsSaIowrpDV2KzjY9gLybqkmqcq9Whv8KwnEqLKKIPKJB-GQyAqkHiKhVZQEvgncIeRB68nxHkfE3pRAvzkKOX+Lpt4QSihWQMACaxhgAUAti4QMxv0yCBR2UC4QwP4vaZMPkVDfy9BsTMcp-7kTvKudcW5dyuRbhyX0GleRaEqCkNQUQZDQSiDyN2FQEiTl5GkBhaoKJUmolAC+UNyptn0oJa0qgkiFzlDvHIPYkxHAiIfYSKRzguhkcGbcR46xYOUYvVSW8lCLAuMBTMNo1h9xyAmEcxREjgVTKWCIs5bL2Wwa3NEEhCggTUJOOECg+I5BWG-Ixmh16Tjdm7bq0VfptDCRyRCCx8y+kqLsC48x7aGRtMmbQdoNBShtirA2f1Fp5NNsKaIzVzjhS5HMCpiTv4WzSUkZQkFSjVHxrFZmrMGAA1GkDVpDjXQWgIUKSCsJhK6MQOvBYSx8yRQlG7Rp-UWb-XZpTambCFluRdOiZZvJlBBVKBIZ0G8FiZB7BIcyaQlhHJuic4muFfhgyfJ0K5a0rTchKRobQqhsTOhqiOfsitrRGPdFZVBkyDaQDBcIdI0RczlH0lOXkoo0aJG4VUCyjsMgKBQYMKOvt7g4rUhsRY+Iey+lhImRQzoSly0gis-sFwskYtLuXQBdir7XISAUM46xYYosav3KhsQPSjOErIKh6LBhWLAMyuY3J3SZC0BsCQ8hNkIBdCkQoUK1gpgsh5CexggA */
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
          entry: ['setNewTargetPosition'],
          invoke: {
            src: 'staticFallingActor',
            input: ({ context, self }) => ({
              node: context.eggRef.current,
              config: {
                durationMS: context.gameConfig.egg.fallingDurationMS,
                x: context.targetPosition.x,
                y: context.targetPosition.y,
                rotation: Math.random() > 0.5 ? 720 : -720,
                onUpdate: (position: Position) => {
                  if (self.getSnapshot().status === 'active') {
                    self.send({
                      type: 'Notify of animation position',
                      position,
                    });
                  }
                },
              },
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
            input: ({ context, self }) => {
              const { stage, egg } = context.gameConfig;
              // The lowest y position the egg can fall before it is considered off screen
              const baseYPos =
                stage.height - egg.brokenEgg.height - stage.margin;

              return {
                node: context.eggRef.current,
                initialPosition: context.initialPosition,
                xSpeed: context.henCurentTweenSpeed,
                ySpeed: egg.fallingSpeed,
                rotationDirection: context.rotationDirection,
                testForDestination: (yPos) => yPos >= baseYPos,
                notifyParentOfPosition: (position: Position) => {
                  if (self.getSnapshot().status === 'active') {
                    self.send({
                      type: 'Notify of animation position',
                      position,
                    });
                  }
                },
              };
            },
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
              config: {
                durationMS: 400,
                x: context.position.x,
                y: context.position.y - 70,
                easing: 'EaseOut',
              },
            }),
            onDone: 'Bouncing Down',
          },
        },
        'Bouncing Down': {
          invoke: {
            src: 'hatchingAnimation',
            input: ({ context }) => ({
              node: context.eggRef.current,
              config: {
                durationMS: 400,
                y: context.eggRef.current!.y() + 70,
                easing: 'BounceEaseOut',
              },
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
          config: {
            durationMS: 1_000,
            x: context.targetPosition.x,
            y: context.targetPosition.y,
          },
        }),
        onDone: 'Done',
      },
    },
    Done: {
      type: 'final',
    },
  },
});
