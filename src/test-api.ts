import type { AppActorRef, EggDropGameActorRef } from './app.machine';
import type { ChefActorRef } from './Chef/chef.machine';
import type { EggActorRef } from './Egg/egg.machine';
import type { GameLevelActorRef } from './GameLevel/gameLevel.machine';

// Basic interface for the test API
export interface TestAPI {
  app: AppActorRef | null;
  chef: ChefActorRef | null;
  gameLevel: GameLevelActorRef | null;
  doneEggActorRefsMap: Map<string, EggActorRef>;
  getChefPosition: () => { x: number; y: number };
  getChefPotRimCenterHitX: (moveDirection: 'right' | 'left') => number;
  getGameLevelScore: () => number;
  getGameLevelRemainingTime: () => number;
  markEggAsDone: (eggActorRef: EggActorRef) => void;
  findAndDeleteDoneEggActorRef: (eggActorRefId: string) => EggActorRef | null;
}

// Type declaration for the window object
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    __TEST_API__?: TestAPI;
  }
}

// Store the latest state from each machine
type TestAPIState = Pick<
  TestAPI,
  'app' | 'chef' | 'gameLevel' | 'doneEggActorRefsMap'
>;
type TestAPIUpdate = Partial<TestAPIState>;

// Metadata about test API updates
interface UpdateMetadata {
  totalUpdates: number;
  lastUpdateTime: number;
  updateCount: number;
}

// Initialize state
const state: TestAPIState = {
  app: null,
  chef: null,
  gameLevel: null,
  doneEggActorRefsMap: new Map(),
};

// Initialize metadata
const metadata: UpdateMetadata = {
  totalUpdates: 0,
  lastUpdateTime: Date.now(),
  updateCount: 0,
};

// Update timer
// let updateTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * The update interval for the test API (200ms).
 *
 * Update Strategy:
 * 1. Batching: Multiple updates within this interval are collected and applied together
 * 2. Debouncing: The actual update is delayed until this interval of inactivity
 *
 * For example, if updates come in at:
 * t=0ms, t=50ms, t=100ms, t=150ms
 * They will be batched together and applied at t=200ms
 *
 * If another update comes at t=250ms, it will be applied at t=450ms
 * (200ms after the last update)
 */
// const UPDATE_INTERVAL = 200;

// Function to create the test API from current state
function createTestAPI(state: TestAPIState): TestAPI {
  return {
    // Expose actor refs for direct access to state machines
    app: state.app as AppActorRef,
    chef: state.chef as ChefActorRef,
    gameLevel: state.gameLevel as GameLevelActorRef,
    doneEggActorRefsMap: state.doneEggActorRefsMap,
    // Convenience getters for commonly accessed values
    getChefPosition: () => {
      return state.chef?.getSnapshot().context.position ?? { x: 0, y: 0 };
    },
    getChefPotRimCenterHitX: (moveDirection: 'right' | 'left') => {
      const snapshot = state.chef?.getSnapshot();
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
    getGameLevelScore: () => {
      return state.gameLevel?.getSnapshot().context.scoreData.levelScore ?? 0;
    },
    getGameLevelRemainingTime: () => {
      return state.gameLevel?.getSnapshot().context.remainingMS ?? 0;
    },
    markEggAsDone: (eggActorRef: EggActorRef) => {
      state.doneEggActorRefsMap.set(eggActorRef.id, eggActorRef);
    },
    findAndDeleteDoneEggActorRef: (eggActorRefId: string) => {
      const doneEggActorRef = state.doneEggActorRefsMap.get(eggActorRefId);
      if (doneEggActorRef) {
        state.doneEggActorRefsMap.delete(eggActorRefId);
        return doneEggActorRef;
      }
      return null;
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

    // console.log('Test API Update:', {
    //   totalUpdates: metadata.totalUpdates,
    //   batchedUpdates: metadata.updateCount,
    //   timeSinceLastUpdate: `${now - metadata.lastUpdateTime;}ms`,
    //   currentTime: new Date(now).toISOString(),
    // });

    // Reset for next batch
    metadata.lastUpdateTime = now;
    metadata.updateCount = 0;
  }
}

// Function to schedule a batched update
// function scheduleUpdate(currentState: TestAPIState): void {
//   if (updateTimer) {
//     return; // Update already scheduled
//   }

//   updateTimer = setTimeout(() => {
//     updateWindowObject(currentState);
//     updateTimer = null;
//   }, UPDATE_INTERVAL);
// }

// // Function to update the test API with new state
// export function updateTestAPI(updates: TestAPIUpdate): void {
//   // Update the state with new values
//   Object.assign(state, updates);

//   // Increment the update counter for this batch
//   metadata.updateCount++;

//   // Schedule a batched update with the current state
//   scheduleUpdate(state);
// }

export function setActorRef(actorRef: EggDropGameActorRef) {
  const partialUpdate: TestAPIUpdate = {};

  switch (actorRef.getSnapshot().machine.id) {
    case 'App':
      partialUpdate.app = actorRef as AppActorRef;
      break;
    case 'Game Level':
      partialUpdate.gameLevel = actorRef as GameLevelActorRef;
      break;
    case 'Chef':
      partialUpdate.chef = actorRef as ChefActorRef;
      break;
    default:
  }

  // Update the state with new values
  Object.assign(state, partialUpdate);

  // Schedule a batched update with the current state  Object.assign(state, updates);

  // Increment the update counter for this batch
  metadata.updateCount++;

  // Schedule a batched update with the current state
  // scheduleUpdate(state);

  updateWindowObject(state);
}

export function markEggAsDone(eggActorRef: EggActorRef) {
  state.doneEggActorRefsMap.set(eggActorRef.id, eggActorRef);
}
