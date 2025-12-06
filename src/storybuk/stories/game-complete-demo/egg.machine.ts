import Konva from 'konva';
import { assign, sendParent, setup } from 'xstate';

import { tweenActor, type TweenConfig } from '../../../tweenActor';
import { isImageRef } from '../../../types';

import type { EggColor } from '../../../Egg/egg.machine';
import type { Position } from '../../../types';

/**
 * Egg Machine - Game Complete Demo
 *
 * Falling egg with full lifecycle support:
 * - Falls with rotation, sending position updates for collision detection
 * - Can be caught mid-fall
 * - If not caught: lands on ground, hatches/splats, runs off
 */

const DEMO_CONFIG = {
  eggWidth: 30,
  eggHeight: 30,
  chickWidth: 60,
  chickHeight: 60,
  fallingDuration: 2, // Duration in seconds for the fall
  groundOffset: 100, // Distance from bottom of canvas
  hatchingPauseDuration: 300,
  jumpUpDuration: 400,
  jumpHeight: 70,
  bounceDuration: 400,
  hatchedPauseDuration: 500,
  exitDuration: 1000,
};

export const eggMachine = setup({
  types: {} as {
    input: {
      id: string;
      position: Position;
      canvasWidth: number;
      canvasHeight: number;
      color: EggColor;
      hatchRate?: number;
    };
    output: {
      eggId: string;
    };
    context: {
      eggRef: React.RefObject<Konva.Image | null> | { current: null };
      id: string;
      position: Position;
      targetPosition: Position;
      canvasWidth: number;
      canvasHeight: number;
      groundY: number;
      color: EggColor;
      hatchRate: number;
      currentTweenDurationMS: number;
      resultStatus: 'Caught' | 'Hatched' | 'Broken' | 'Offscreen';
      jumpStartY: number;
      jumpStartTime: number;
      exitTargetX: number;
    };
    events:
      | { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image | null> }
      | { type: 'Notify of animation position'; position: Position }
      | { type: 'Catch' };
  },
  actors: {
    fallingTweenActor: tweenActor,
    hatchingJumpTweenActor: tweenActor,
    exitingTweenActor: tweenActor,
  },
  actions: {
    setEggRef: assign(
      ({ context }, params: React.RefObject<Konva.Image | null>) => {
        // Set the node position immediately when ref is attached
        if (params.current) {
          params.current.setPosition(context.position);
        }
        return { eggRef: params };
      }
    ),
    setTweenProperties: assign({
      targetPosition: ({ context }) => ({
        x: context.position.x,
        y: context.groundY,
      }),
      currentTweenDurationMS: () => DEMO_CONFIG.fallingDuration * 1000,
    }),
    updatePositionFromAnimation: assign({
      position: (_, params: Position) => params,
    }),
    notifyParentOfPosition: sendParent(({ context }) => ({
      type: 'Egg position updated',
      eggId: context.id,
      position: context.position,
      eggColor: context.color,
    })),
    setFinalPosition: assign({
      position: (_, params: Position) => params,
    }),
    setCaughtStatus: assign({
      resultStatus: 'Caught' as const,
    }),
    setHatchedStatus: assign({
      resultStatus: 'Hatched' as const,
    }),
    setBrokenStatus: assign({
      resultStatus: 'Broken' as const,
    }),
    positionEggOnGround: assign({
      position: ({ context }) => ({
        x: context.position.x,
        y: context.groundY,
      }),
    }),
    setJumpStartValues: assign({
      jumpStartY: ({ context }) => context.position.y,
      jumpStartTime: () => new Date().getTime(),
    }),
    setExitTargetX: assign({
      exitTargetX: ({ context }) => {
        // Determine exit direction based on position
        const midX = context.canvasWidth / 2;
        if (context.position.x < midX) {
          return -50; // Exit left
        } else {
          return context.canvasWidth + 50; // Exit right
        }
      },
    }),
  },
  guards: {
    canHatch: ({ context }) => {
      if (context.color === 'black') {
        return false;
      }
      if (context.color === 'gold') {
        return true;
      }
      // White eggs: probabilistic
      return Math.random() < context.hatchRate;
    },
  },
  delays: {
    hatchingPause: DEMO_CONFIG.hatchingPauseDuration,
    hatchedPause: DEMO_CONFIG.hatchedPauseDuration,
    splattingDuration: 1000,
  },
}).createMachine({
  id: 'Egg-Game-Complete-Demo',
  context: ({ input }) => {
    const groundY = input.canvasHeight - DEMO_CONFIG.groundOffset;
    return {
      eggRef: { current: null },
      id: input.id,
      position: input.position,
      targetPosition: input.position,
      canvasWidth: input.canvasWidth,
      canvasHeight: input.canvasHeight,
      groundY,
      color: input.color,
      hatchRate: input.hatchRate ?? 0.5,
      currentTweenDurationMS: 0,
      resultStatus: 'Offscreen' as const,
      jumpStartY: groundY,
      jumpStartTime: 0,
      exitTargetX: 0,
    };
  },
  output: ({ context }) => ({
    eggId: context.id,
  }),
  initial: 'Idle',
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
      entry: 'setTweenProperties',
      invoke: {
        src: 'fallingTweenActor',
        input: ({ context, self }) => {
          if (!isImageRef(context.eggRef)) {
            throw new Error('Egg ref is not set');
          }

          const config: TweenConfig = {
            durationMS: context.currentTweenDurationMS,
            x: context.targetPosition.x,
            y: context.targetPosition.y,
            rotation: Math.random() > 0.5 ? 720 : -720,
            onUpdate: (position: Position) => {
              // Send position updates during animation for collision detection
              if (self.getSnapshot().status === 'active') {
                self.send({
                  type: 'Notify of animation position',
                  position,
                });
              }
            },
          };

          return {
            node: context.eggRef.current,
            config,
          };
        },
        onDone: {
          target: 'Landed',
          actions: {
            type: 'setFinalPosition',
            params: ({ event }) => event.output,
          },
        },
      },
      on: {
        'Notify of animation position': {
          actions: [
            {
              type: 'updatePositionFromAnimation',
              params: ({ event }) => event.position,
            },
            'notifyParentOfPosition',
          ],
        },
        Catch: {
          target: 'Caught',
        },
      },
    },
    Landed: {
      entry: 'positionEggOnGround',
      always: [
        {
          guard: 'canHatch',
          target: 'Hatching',
        },
        {
          target: 'Splatting',
        },
      ],
    },
    Hatching: {
      tags: 'hatching',
      after: {
        hatchingPause: 'Hatching Jump',
      },
    },
    'Hatching Jump': {
      tags: 'hatching-jump',
      entry: 'setJumpStartValues',
      initial: 'Jumping Up',
      states: {
        'Jumping Up': {
          invoke: {
            src: 'hatchingJumpTweenActor',
            input: ({ context }) => {
              if (!isImageRef(context.eggRef) || !context.eggRef.current) {
                throw new Error('Egg ref is not set');
              }

              const config: TweenConfig = {
                durationMS: DEMO_CONFIG.jumpUpDuration,
                x: context.position.x,
                y: context.position.y - DEMO_CONFIG.jumpHeight,
                easing: 'EaseOut',
              };

              return {
                node: context.eggRef.current,
                config,
              };
            },
            onDone: {
              target: 'Bouncing Down',
            },
          },
        },
        'Bouncing Down': {
          invoke: {
            src: 'hatchingJumpTweenActor',
            input: ({ context }) => {
              if (!isImageRef(context.eggRef) || !context.eggRef.current) {
                throw new Error('Egg ref is not set');
              }

              const config: TweenConfig = {
                durationMS: DEMO_CONFIG.bounceDuration,
                y: context.eggRef.current.y() + DEMO_CONFIG.jumpHeight,
                easing: 'BounceEaseOut',
              };

              return {
                node: context.eggRef.current,
                config,
              };
            },
            onDone: {
              target: '#Egg-Game-Complete-Demo.Hatched',
            },
          },
        },
      },
    },
    Hatched: {
      tags: 'hatched',
      entry: 'setHatchedStatus',
      after: {
        hatchedPause: 'Exiting',
      },
    },
    Exiting: {
      tags: 'exiting',
      entry: 'setExitTargetX',
      invoke: {
        src: 'exitingTweenActor',
        input: ({ context }) => {
          if (!isImageRef(context.eggRef) || !context.eggRef.current) {
            throw new Error('Egg ref is not set or current is null');
          }

          const config: TweenConfig = {
            durationMS: DEMO_CONFIG.exitDuration,
            x: context.exitTargetX,
          };

          return {
            node: context.eggRef.current,
            config,
          };
        },
        onDone: {
          target: 'Done',
        },
      },
    },
    Splatting: {
      tags: 'splatting',
      entry: 'setBrokenStatus',
      after: {
        splattingDuration: 'Done',
      },
    },
    Caught: {
      tags: 'caught',
      entry: 'setCaughtStatus',
      type: 'final',
    },
    Done: {
      type: 'final',
    },
  },
});
