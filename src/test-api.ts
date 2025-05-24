import { CHEF_ACTOR_ID, GAME_LEVEL_ACTOR_ID } from './constants';

import type { AppActorRef } from './app.machine';
import type { EggActorRef, EggColor, EggResultStatus } from './Egg/egg.machine';
import type { Direction, Position } from './types';

// Basic interface for the test API

export interface ChefData {
  position: Position;
  speed: number;
  speedLimit: number;
  acceleration: number;
  deceleration: number;
  minXPos: number;
  maxXPos: number;
  direction: Direction['value'];
  movingDirection: Direction['label'];
  potRimOffsetX: number;
  potRimCenterOffsetX: number;
}

export interface EggData {
  id: string;
  position: Position;
  color: EggColor;
}

export interface EggHistoryEntry extends EggData {
  resultStatus: EggResultStatus;
}

export interface ChefAndEggsData {
  chef: ChefData;
  eggs: EggData[];
}
export interface TestAPI {
  app: AppActorRef | null;
  eggHistory: Map<string, EggHistoryEntry>;
  getChefPosition: () => { x: number; y: number };
  getChefAndEggsData: () => ChefAndEggsData;
  getGameLevelScore: () => number;
  getGameLevelRemainingTime: () => number;
  addEggToHistory: (eggHistoryEntry: EggHistoryEntry) => void;
  findEggInHistory: (id: string) => EggHistoryEntry | undefined;
  purgeEggFromHistory: (id: string) => void;
}

// Type declaration for the window object
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    __TEST_API__?: TestAPI;
  }
}

// Store the latest state from each machine
type TestAPIState = Pick<TestAPI, 'app' | 'eggHistory'>;

// Metadata about test API updates
interface UpdateMetadata {
  totalUpdates: number;
  lastUpdateTime: number;
  updateCount: number;
}

// Initialize state
const state: TestAPIState = {
  app: null,
  eggHistory: new Map(),
};

// Initialize metadata
const metadata: UpdateMetadata = {
  totalUpdates: 0,
  lastUpdateTime: Date.now(),
  updateCount: 0,
};

// Function to create the test API from current state
function createTestAPI(state: TestAPIState): TestAPI {
  return {
    // Expose actor refs for direct access to state machines
    app: state.app as AppActorRef,
    eggHistory: state.eggHistory,
    // Convenience getters for commonly accessed values
    getChefPosition: () => {
      return (
        state.app?.system.get(CHEF_ACTOR_ID)?.getSnapshot().context
          .position ?? { x: 0, y: 0 }
      );
    },
    getChefAndEggsData: () => {
      const gameConfig = state.app?.getSnapshot()?.context.gameConfig;
      const chefSnapshot = state.app?.system.get(CHEF_ACTOR_ID)?.getSnapshot();
      const chefContext = chefSnapshot.context;
      const chefXPos = chefContext.position.x ?? 0;
      const potRimOffsetX = gameConfig?.chef.potRim.offsetX ?? 0;
      const direction: number = chefContext.direction;

      const chefData: ChefData = {
        position: chefContext.position ?? { x: 0, y: 0 },
        speed: chefContext.speed ?? 0,
        speedLimit: chefContext.speedLimit ?? 0,
        acceleration: chefContext.acceleration ?? 0,
        deceleration: chefContext.deceleration ?? 0,
        minXPos: chefContext.minXPos ?? 0,
        maxXPos: chefContext.maxXPos ?? 0,
        direction: chefContext.direction ?? 0,
        movingDirection: chefContext.movingDirection ?? 'none',
        potRimOffsetX: gameConfig?.chef.potRim.offsetX ?? 0,
        potRimCenterOffsetX:
          chefXPos *
          direction *
          potRimOffsetX *
          0.5 *
          (gameConfig?.chef.potRim.width ?? 150),
      };

      // if (moveDirection === 'right') {
      //   return (
      //     chefXPos +
      //     potRimOffsetX +
      //     0.5 * (gameConfig?.chef.potRim.width ?? 150)
      //   );
      // } else {
      //   return (
      //     chefXPos -
      //     potRimOffsetX -
      //     0.5 * (gameConfig?.chef.potRim.width ?? 150)
      //   );
      // }

      const gameLevelSnapshot = state.app?.system
        .get(GAME_LEVEL_ACTOR_ID)
        .getSnapshot();

      const gameLevelContext = gameLevelSnapshot.context;

      const eggsData: EggData[] = gameLevelContext.eggActorRefs.map(
        (eggActorRef: EggActorRef) => ({
          id: eggActorRef.id,
          position: eggActorRef.getSnapshot().context.position,
          color: eggActorRef.getSnapshot().context.color,
        })
      );

      const chefAndEggsData: ChefAndEggsData = {
        chef: chefData,
        eggs: eggsData,
      };

      return chefAndEggsData;
    },
    getGameLevelScore: () => {
      return (
        state.app?.system.get(GAME_LEVEL_ACTOR_ID).getSnapshot().context
          .scoreData.levelScore ?? 0
      );
    },
    getGameLevelRemainingTime: () => {
      return (
        state.app?.system.get(GAME_LEVEL_ACTOR_ID).getSnapshot().getSnapshot()
          .context.remainingMS ?? 0
      );
    },
    addEggToHistory: (eggHistoryEntry: EggHistoryEntry) => {
      state.eggHistory.set(eggHistoryEntry.id, eggHistoryEntry);
    },
    findEggInHistory: (id: string) => {
      return state.eggHistory.get(id);
    },
    purgeEggFromHistory: (id: string) => {
      state.eggHistory.delete(id);
    },
  };
}

// Function to update the window object with the test API
function updateWindowObject(state: TestAPIState): void {
  if (typeof window !== 'undefined') {
    window.__TEST_API__ = createTestAPI(state);

    // Update metadata
    const now = Date.now();
    metadata.totalUpdates += metadata.updateCount;

    // Reset for next batch
    metadata.lastUpdateTime = now;
    metadata.updateCount = 0;
  }
}

export function setActorRef(appActorRef: AppActorRef) {
  // Update the state with new values
  Object.assign(state, {
    app: appActorRef,
  });

  // Increment the update counter for this batch
  metadata.updateCount++;

  updateWindowObject(state);
}
