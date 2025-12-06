import { fromPromise } from 'xstate';

import type { Position, RequireAtLeastOne } from '../types';

// Base interface for headless tween configuration options
export interface TweenConfigHeadlessBase {
  durationMS: number;
}

// Target properties interface (all optional in base)
interface TweenTargets {
  x?: number;
  y?: number;
  rotation?: number;
  opacity?: number;
}

// TweenConfigHeadless: base config with at least one target property required
export type TweenConfigHeadless = TweenConfigHeadlessBase &
  RequireAtLeastOne<TweenTargets>;

/**
 * Headless Tween Actor
 *
 * A pure-data version of tweenActor that simulates animation timing
 * without any Konva dependencies. Returns the target position after
 * the tween duration has elapsed.
 *
 * Purpose: Enable state machine visualization in Stately Inspector
 * without Konva serialization issues.
 *
 * Accepts a TweenConfigHeadless object (matching the pattern of the
 * real tweenActor's TweenConfig) for consistency across the codebase.
 */
export const tweenActorHeadless = fromPromise<
  Position,
  {
    config: TweenConfigHeadless;
  }
>(({ input }) => {
  return new Promise((resolve) => {
    const { durationMS, x, y } = input.config;

    // Simulate the tween duration
    setTimeout(() => {
      // Return the target position
      resolve({
        x: x ?? 0,
        y: y ?? 0,
      });
    }, durationMS);
  });
});
