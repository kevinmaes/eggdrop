import { setup } from 'xstate';
import { getGameConfig } from '../../src/GameLevel/gameConfig';
import { CHEF_ACTOR_ID, ChefActorRef } from '../../src/Chef/chef.machine';
import {
  GAME_LEVEL_ACTOR_ID,
  GameLevelActorRef,
} from '../../src/GameLevel/gameLevel.machine';
import { APP_ACTOR_ID, AppActorRef } from '../../src/app.machine';
import { EggActorRef } from '../../src/Egg/egg.machine';
import { eventBus } from '../../src/shared/eventBus';
import { assign } from 'xstate';

type GameActorId =
  | typeof APP_ACTOR_ID
  | typeof GAME_LEVEL_ACTOR_ID
  | typeof CHEF_ACTOR_ID;

const chefBotMachine = setup({
  types: {} as {
    context: {
      gameConfig: ReturnType<typeof getGameConfig>;
      gameActors: Map<string, any>;
      eggActors: Map<string, EggActorRef>;
    };
    events:
      | { type: 'Start' }
      | { type: 'Next' }
      | { type: 'Register game actor'; data: { actorId: string; actor: any } }
      | {
          type: 'Register egg actor';
          data: { actorId: string; actor: EggActorRef };
        };
  },
  guards: {
    ifMoreEggs: ({ context }) => {
      return (
        (context.gameActors.get('Game Level')?.gameLevelActor?.getSnapshot()
          .context.eggActorRefs.length ?? 0) > 0
      );
    },
  },
  actions: {
    setTestActorOnEventBus: ({ context, self }) => {
      eventBus.setTestActor(self);
    },
  },
  actors: {},
}).createMachine({
  id: 'chefBot',
  initial: 'Idle',
  context: {
    gameConfig: getGameConfig(),
    gameActors: new Map(),
    eggActors: new Map(),
  },
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
