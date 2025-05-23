import { setup } from 'xstate';
import { getGameConfig } from '../../src/GameLevel/gameConfig';
import { ChefActorRef } from '../../src/Chef/chef.machine';
import { GameLevelActorRef } from '../../src/GameLevel/gameLevel.machine';
import { AppActorRef } from '../../src/app.machine';
import { EggActorRef } from '../../src/Egg/egg.machine';
import { eventBus } from '../../src/shared/eventBus';
import { assign } from 'xstate';

const chefBotMachine = setup({
  types: {} as {
    context: {
      gameConfig: ReturnType<typeof getGameConfig>;
      appActorRef: AppActorRef | null;
      gameLevelActor: GameLevelActorRef | null;
      chefActor: ChefActorRef | null;
      doneEggActorRefsMap: Map<string, EggActorRef>;
    };
    events:
      | { type: 'Set appActorRef'; appActorRef: AppActorRef }
      | { type: 'Set gameLevelActor'; gameLevelActor: GameLevelActorRef }
      | { type: 'Set chefActor'; chefActor: ChefActorRef }
      | { type: 'Start' }
      | { type: 'Next' }
      | { type: 'gameActorRegistered'; data: { actorId: string; actor: any } };
  },
  guards: {
    ifMoreEggs: ({ context }) => {
      return (
        (context.gameLevelActor?.getSnapshot().context.eggActorRefs.length ??
          0) > 0
      );
    },
  },
  actors: {},
}).createMachine({
  id: 'chefBot',
  initial: 'idle',
  context: {
    gameConfig: getGameConfig(),
    appActorRef: null,
    gameLevelActor: null,
    chefActor: null,
    doneEggActorRefsMap: new Map(),
  },
  states: {
    idle: {
      on: {
        Start: 'initializing',
      },
    },
    initializing: {
      on: {
        gameActorRegistered: {
          actions: [
            ({ event }) => {
              if (!event || !('data' in event)) return;
              const { actorId, actor } = event.data;
              // Store the actor reference based on its type
              if (actorId.includes('app')) {
                eventBus.emit('Set appActorRef', { appActorRef: actor });
              } else if (actorId.includes('gameLevel')) {
                eventBus.emit('Set gameLevelActor', { gameLevelActor: actor });
              } else if (actorId.includes('chef')) {
                eventBus.emit('Set chefActor', { chefActor: actor });
              }
            },
          ],
        },
        'Set appActorRef': {
          actions: assign({
            appActorRef: (_, event) => event.appActorRef,
          }),
        },
        'Set gameLevelActor': {
          actions: assign({
            gameLevelActor: (_, event) => event.gameLevelActor,
          }),
        },
        'Set chefActor': {
          actions: assign({
            chefActor: (_, event) => event.chefActor,
          }),
        },
      },
      always: {
        guard: ({ context }) =>
          context.appActorRef !== null &&
          context.gameLevelActor !== null &&
          context.chefActor !== null,
        target: 'analyzing',
      },
    },
    analyzing: {
      on: {
        Next: 'moving',
      },
    },
    moving: {
      on: {
        Next: 'catching',
      },
    },
    catching: {
      on: {
        Next: 'evaluating',
      },
    },
    evaluating: {
      on: {
        Next: [
          {
            guard: 'ifMoreEggs',
            target: 'analyzing',
          },
          {
            target: 'done',
          },
        ],
      },
    },
    done: {
      type: 'final',
    },
  },
});

export { chefBotMachine };
