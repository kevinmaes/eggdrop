# vite-project

## 0.2.1

### Patch Changes

- 4abbc19: Fix egg catching hit detection to account for rotation and improve collision detection accuracy.

  Previously, the hit detection guard calculated the egg's leading edge using a simple calculation that assumed the leading edge was always at the center Y position. Since eggs rotate as they fall, the actual lowest point changes based on rotation angle, causing some eggs to be missed.

  Changes:
  - Calculate the rotated bounding box in the egg actor using Konva's `getClientRect()` which accounts for rotation
  - Pass the `eggBoundingBox` in the event payload for accurate hit detection
  - Improve collision detection to check full bounding box overlap instead of just center point
  - Extract bounding box overlap logic into a reusable pure function (`doBoundingBoxesOverlap`) with comprehensive unit tests
  - Add performance optimizations with early returns for X and Y axis checks before full overlap detection

- 54d5bb3: Updated xstate dependency to version 5.24
- d21eb82: Update badge for XState
- 248850d: Fix automated bot test and add intensity control
  - Fixed null reference error in LevelScoreBox preventing game crashes
  - Improved physics calculations for egg reachability
  - Added automated test intensity multiplier for configurable difficulty
  - Added 1 second intro screen delay before bot starts
  - Improved test viewport configuration for better recording

- 117bdf2: Use lowercase guard types
- e2fc14e: Make sounds loaded statically
- 3d2dd81: Refine the loading experience by moving the loading flow into a dedicated XState actor, polishing the SVG loader animation, and keeping the animation consistent from 0% through completion.
- d9f41ce: Remove explicit type for createActorContext
- 3d2dd81: Update title graphic image to "Sup"
- 03b424a: Refactor tweenActor to encapsulate Konva.Tween instantiation. The actor now accepts a TweenConfig object with animation parameters and creates tweens internally, following the pattern established by eggMotionActor. This eliminates redundant context storage and simplifies the API for all consuming state machines.

## 0.2.0

### Minor Changes

- b9bdb3f: Install changesets and release workflow with @kevinmaes/changesets-workflow package from npm

### Patch Changes

- b4b877a: Clean up state machine code
- fa2c723: Updated dependencies and fully switched to pnpm
- f31a20e: Add workflow_dispatch to ci workflow
- 5508186: Hide chef pot hit area targets
- 006a5dd: Update reade badges
