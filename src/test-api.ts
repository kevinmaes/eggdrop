import { CHEF_ACTOR_ID, GAME_LEVEL_ACTOR_ID } from './constants';

import type { AppActorRef } from './app.machine';
import type { ChefActorRef } from './Chef/chef.machine';
import type { EggActorRef, EggColor, EggResultStatus } from './Egg/egg.machine';
import type { GameConfig } from './GameLevel/gameConfig';
import type { GameLevelActorRef } from './GameLevel/gameLevel.machine';
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
  getGameConfig: () => GameConfig | undefined;
  getChefPosition: () => ChefData;
  getChefPotRimCenterHitX: (moveDirection: 'right' | 'left') => number;
  getChefAndEggsData: () => ChefAndEggsData;
  getGameLevelScore: () => number;
  getGameLevelRemainingTime: () => number;
  // addEggToHistory: (eggHistoryEntry: EggHistoryEntry) => void;
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
    getGameConfig: () => {
      return state.app?.getSnapshot()?.context.gameConfig;
    },
    getChefPosition: () => {
      const gameConfig = state.app?.getSnapshot()?.context.gameConfig;
      const chefActorRef = state.app?.system.get(CHEF_ACTOR_ID) as ChefActorRef;
      const chefContext = chefActorRef.getSnapshot().context;
      const chefXPos = chefContext.position.x;
      const potRimOffsetX = gameConfig?.chef.potRim.offsetX ?? 0;
      const movingDirection = chefContext.movingDirection;
      const chefPotRimWidth = gameConfig?.chef.potRim.width ?? 150;
      const halfChefPotRimWidth = 0.5 * chefPotRimWidth;

      const potRimCenterOffsetX =
        movingDirection === 'right'
          ? chefXPos + potRimOffsetX + halfChefPotRimWidth
          : chefXPos - potRimOffsetX - halfChefPotRimWidth;

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
        potRimCenterOffsetX,
      };

      return chefData;
    },
    getChefPotRimCenterHitX: (moveDirection: 'right' | 'left') => {
      const snapshot = state.app?.system.get(CHEF_ACTOR_ID).getSnapshot();
      const gameConfig = snapshot?.context.gameConfig;
      const chefXPos = snapshot?.context.position.x ?? 0;
      const potRimOffsetX = gameConfig?.chef.potRim.offsetX ?? 0;

      if (moveDirection === 'right') {
        return (
          chefXPos +
          potRimOffsetX +
          0.5 * (gameConfig?.chef.potRim.width ?? 150)
        );
      } else {
        return (
          chefXPos -
          potRimOffsetX -
          0.5 * (gameConfig?.chef.potRim.width ?? 150)
        );
      }
    },
    getChefAndEggsData: () => {
      const gameConfig = state.app?.getSnapshot()?.context.gameConfig;
      const gameLevelActorRef = state.app?.system.get(
        GAME_LEVEL_ACTOR_ID
      ) as GameLevelActorRef;
      const chefActorRef = state.app?.system.get(CHEF_ACTOR_ID) as ChefActorRef;
      const chefSnapshot = chefActorRef?.getSnapshot();
      const chefContext = chefSnapshot.context;
      const chefXPos = chefContext.position.x ?? 0;
      const potRimOffsetX = gameConfig?.chef.potRim.offsetX ?? 0;
      const direction = chefContext.direction;

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

      const { eggActorRefs } = gameLevelActorRef.getSnapshot().context;
      const eggsData: EggData[] = eggActorRefs.map(
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

export function setAppActorRef(appActorRef: AppActorRef) {
  // Update the state with new values
  Object.assign(state, {
    app: appActorRef,
  });

  // Increment the update counter for this batch
  metadata.updateCount++;
  updateWindowObject(state);
}

export function addEggToHistory(eggHistoryEntry: EggHistoryEntry) {
  state.eggHistory.set(eggHistoryEntry.id, eggHistoryEntry);
}
