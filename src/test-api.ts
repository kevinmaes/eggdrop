import type { ActorRefFrom } from 'xstate';
import type { chefMachine } from './Chef/chef.machine';
import type { gameLevelMachine } from './GameLevel/gameLevel.machine';

// Basic interface for the test API
export interface TestAPI {
  chef: {
    position: { x: number; y: number };
  };
  gameLevel: {
    remainingTime: number;
    score: number;
  };
}

// Type declaration for the window object
declare global {
  interface Window {
    __TEST_API__?: TestAPI;
  }
}

// Store the latest state from each machine
interface TestAPIState {
  chef: ActorRefFrom<typeof chefMachine> | null;
  gameLevel: ActorRefFrom<typeof gameLevelMachine> | null;
}

// Metadata about test API updates
interface UpdateMetadata {
  totalUpdates: number;
  lastUpdateTime: number;
  updateCount: number;
}

// Initialize state
const state: TestAPIState = {
  chef: null,
  gameLevel: null,
};

// Initialize metadata
const metadata: UpdateMetadata = {
  totalUpdates: 0,
  lastUpdateTime: Date.now(),
  updateCount: 0,
};

// Update timer
let updateTimer: ReturnType<typeof setTimeout> | null = null;

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
const UPDATE_INTERVAL = 500;

// Function to create the test API from current state
function createTestAPI(state: TestAPIState): TestAPI {
  return {
    chef: {
      get position() {
        return state.chef?.getSnapshot().context.position ?? { x: 0, y: 0 };
      },
    },
    gameLevel: {
      get remainingTime() {
        return state.gameLevel?.getSnapshot().context.remainingMS ?? 0;
      },
      get score() {
        return state.gameLevel?.getSnapshot().context.scoreData.levelScore ?? 0;
      },
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
    const timeSinceLastUpdate = now - metadata.lastUpdateTime;

    console.log('Test API Update:', {
      totalUpdates: metadata.totalUpdates,
      batchedUpdates: metadata.updateCount,
      timeSinceLastUpdate: `${timeSinceLastUpdate}ms`,
      currentTime: new Date(now).toISOString(),
    });

    // Reset for next batch
    metadata.lastUpdateTime = now;
    metadata.updateCount = 0;
  }
}

// Function to schedule a batched update
function scheduleUpdate(currentState: TestAPIState): void {
  if (updateTimer) {
    return; // Update already scheduled
  }

  updateTimer = setTimeout(() => {
    updateWindowObject(currentState);
    updateTimer = null;
  }, UPDATE_INTERVAL);
}

// Function to update the test API with new state
export function updateTestAPI(
  updates: Partial<{
    chef: ActorRefFrom<typeof chefMachine>;
    gameLevel: ActorRefFrom<typeof gameLevelMachine>;
  }>
): void {
  // Update the state with new values
  Object.assign(state, updates);

  // Increment the update counter for this batch
  metadata.updateCount++;

  // Schedule a batched update with the current state
  scheduleUpdate(state);
}
