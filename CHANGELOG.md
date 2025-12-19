# vite-project

## 0.3.3

### Patch Changes

- c7e2fce: Rename promote-to-main workflow to auto-promote-and-release and add automatic GitHub Release creation. Releases are created with version tags (v0.x.x) and changelog content extracted from CHANGELOG.md.
- 9abd0ae: Rename release-to-main to promote-to-main and add automatic trigger on Version Packages PR merge
- 08f598d: Rename workflows to follow Changesets conventions: version.yml becomes release.yml (creates Version Packages PR), and release.yml becomes deploy.yml (promotes to main and creates GitHub Release).

## 0.3.2

### Patch Changes

- d4a565a: Fix loader animation to start at 0% instead of 10%
- a7ff40d: Fix Version Packages PR not triggering CI workflows by supporting PAT token for changesets action
- c47d6ec: Implement persistent stage plan - render Konva stage continuously during loading with translucent overlay curtain instead of replacing the stage. This ensures the scene is ready the moment gameplay begins, helping to cover up noticeable graphics mounting time.
- cc1c123: Add manual trigger option to Version workflow

## 0.3.1

### Patch Changes

- fb94a55: Update Claude.md documentation to clarify that PRs should target dev branch by default and include PR workflow instructions with changeset creation
- b052960: Fix Vercel routing to serve static assets correctly. Add filesystem handler to prevent redirecting JS/CSS files to index.html
- fb94a55: Add SPA routing support for Vercel deployment. Fixes 404 errors when accessing routes directly or refreshing on non-root routes.

## 0.3.0

### Minor Changes

- 1cd87b9: Add Storybuk demo studio for composable actor showcases

  Introduces a comprehensive demo studio (Storybuk) that showcases individual actor state machines and their compositions. This zero-bloat platform enables developers to view, test, and understand actor behaviors in isolation and in combination.

  Key features:
  - Interactive story navigation with sprite icons and visual indicators
  - Dual-mode demos showing both headless state machines and visual presentations
  - Stately Inspector integration for real-time state machine visualization
  - Embedded Stately statechart visualizations alongside demos
  - Individual actor stories (Chef, Hen, Egg, Chick) demonstrating core behaviors
  - Multi-actor compositions showing synchronized interactions
  - Presentation layouts optimized for demos (1920x1080)
  - Play/pause/reset controls with synchronized playback
  - Theme toggle support for different viewing preferences
  - Keyboard indicator for interactive demos

  Technical improvements:
  - Refactored position calculations to match game pattern
  - Enhanced sprite animations with improved timing and synchronization
  - Centralized story configuration system
  - Shared inspector utilities for state machine debugging
  - TypeScript strict mode compliance across all stories

### Patch Changes

- 2bd22c7: Fix egg count in score board starting with "x" instead of "0"

  The egg count display in the score board during gameplay now correctly starts at "0" instead of displaying "x" when no eggs have been caught yet.

- f472ecc: Add more explicit workflow triggers and improve reporting
- f0c5dc2: Fix component file formatting
- 7b03f2b: Create util functions for bounding box checks

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
