import { fromPromise } from 'xstate';

import type { Position } from '../types';

/**
 * Headless Tween Actor
 *
 * A pure-data version of tweenActor that simulates animation timing
 * without any Konva dependencies. Returns the target position after
 * the tween duration has elapsed.
 *
 * Purpose: Enable state machine visualization in Stately Inspector
 * without Konva serialization issues.
 */
export const tweenActorHeadless = fromPromise<
  { lastPosition: Position },
  {
    currentTweenSpeed: number;
    currentTweenDurationMS: number;
    currentTweenStartTime: number;
    tweenDirection: number;
    targetPosition: Position;
  }
>(({ input }) => {
  return new Promise((resolve) => {
    // Simulate the tween duration
    setTimeout(() => {
      // Return the target position as the "last position"
      resolve({
        lastPosition: input.targetPosition,
      });
    }, input.currentTweenDurationMS);
  });
});
