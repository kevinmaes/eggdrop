import type { ActorRefFrom } from 'xstate';
import type { chefMachine } from './Chef/chef.machine';

// Basic interface for the test API
export interface TestAPI {
  chef: {
    position: { x: number; y: number };
  };
}

// Type declaration for the window object
declare global {
  interface Window {
    __TEST_API__?: TestAPI;
  }
}

// Function to create the test API
export function createTestAPI(
  chefActor: ActorRefFrom<typeof chefMachine>
): TestAPI {
  return {
    chef: {
      get position() {
        return chefActor.getSnapshot().context.position;
      },
    },
  };
}

// Function to update the test API on the window object
export function updateTestAPI(chefActor: ActorRefFrom<typeof chefMachine>) {
  if (typeof window !== 'undefined') {
    window.__TEST_API__ = createTestAPI(chefActor);
    // console.log('Test API updated', window.__TEST_API__);
  }
}
