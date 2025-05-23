import { setup } from 'xstate';
import type { ChefActorRef } from '../../src/Chef/chef.machine';
import type { GameLevelActorRef } from '../../src/GameLevel/gameLevel.machine';
import type { AppActorRef } from '../../src/app.machine';
import type { EggActorRef } from '../../src/Egg/egg.machine';
import { eventBus } from '../../src/shared/eventBus';
import { assign } from 'xstate';

// Import only the IDs as values
import {
  APP_ACTOR_ID,
  GAME_LEVEL_ACTOR_ID,
  CHEF_ACTOR_ID,
} from '../../src/constants';

type GameActorId =
  | typeof APP_ACTOR_ID
  | typeof GAME_LEVEL_ACTOR_ID
  | typeof CHEF_ACTOR_ID;
type AnyGameActorRef = AppActorRef | GameLevelActorRef | ChefActorRef;

const chefBotMachine = setup({
  types: {} as {
    context: {
      gameActors: Map<string, AnyGameActorRef>;
      eggActors: Map<string, EggActorRef>;
    };
    events:
      | { type: 'Start' }
      | { type: 'Next' }
      | {
          type: 'Register game actor';
          data: { actorId: string; actor: AnyGameActorRef };
        }
      | {
          type: 'Register egg actor';
          data: { actorId: string; actor: EggActorRef };
        };
  },
  guards: {
    ifMoreEggs: ({ context }) => {
      return (
        ((
          context.gameActors.get(GAME_LEVEL_ACTOR_ID) as GameLevelActorRef
        )?.getSnapshot().context.eggActorRefs.length ?? 0) > 0
      );
    },
  },
  actions: {
    setTestActorOnEventBus: ({ self }) => {
      eventBus.setTestActor(self);
    },
  },
  actors: {},
}).createMachine({
  id: 'chefBot',
  initial: 'Idle',
  context: ({ input }) => ({
    gameActors: new Map(),
    eggActors: new Map(),
  }),
  entry: 'setTestActorOnEventBus',
  states: {
    Idle: {
      on: {
        Start: 'Initializing',
      },
    },
    Initializing: {
      on: {
        'Register game actor': {
          actions: assign({
            gameActors: ({ context, event }) => {
              context.gameActors.set(event.data.actorId, event.data.actor);
              return new Map(context.gameActors);
            },
          }),
        },
      },
      always: {
        guard: ({ context }) =>
          context.gameActors.get('App') !== undefined &&
          context.gameActors.get('Game Level') !== undefined &&
          context.gameActors.get('Chef') !== undefined,
        target: 'Playing',
      },
    },
    Playing: {
      on: {
        'Register egg actor': {
          actions: assign({
            eggActors: ({ context, event }) => {
              context.eggActors.set(event.data.actorId, event.data.actor);
              return new Map(context.eggActors);
            },
          }),
        },
      },
      initial: 'Analyzing',
      states: {
        Analyzing: {
          on: {
            Next: 'Moving',
          },
        },
        Moving: {
          on: {
            Next: 'Catching',
          },
        },
        Catching: {
          on: {
            Next: 'Evaluating',
          },
        },
        Evaluating: {
          on: {
            Next: [
              {
                guard: 'ifMoreEggs',
                target: 'Analyzing',
              },
              {
                target: 'Level Complete',
              },
            ],
          },
        },
        'Level Complete': {
          type: 'final',
        },
      },
    },
    Done: {
      type: 'final',
    },
  },
});

export { chefBotMachine };
