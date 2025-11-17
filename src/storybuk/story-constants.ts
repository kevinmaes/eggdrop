/**
 * Storybuk Constants
 *
 * Shared constants for story configurations to ensure consistency
 * across all stories of the same actor type.
 *
 * All positioning is calculated dynamically based on STORY_CANVAS dimensions.
 * Change STORY_CANVAS.width to adjust all stories (e.g., half width = 640).
 */

import type { SplitOrientation } from './storybuk-theme';

/**
 * Presentation Layout Modes
 *
 * Optimized layouts for 1920x1080 presentation recording:
 * - horizontal-split: Story on left (25%), Inspector on right (75%)
 * - horizontal-split-narrow: Story on left (20%), Inspector on right (80%)
 * - vertical-split-top: Story on top (10%), Inspector on bottom (90%)
 * - vertical-split-bottom: Inspector on top (90%), Story on bottom (10%)
 */
export type LayoutMode =
  | 'horizontal-split'
  | 'horizontal-split-narrow'
  | 'vertical-split-top'
  | 'vertical-split-bottom';

/**
 * Presentation Layout Dimensions
 *
 * Full presentation canvas is always 1920x1080
 * - 10% height = 108px
 * - 90% height = 972px
 * - 20% width = 384px
 * - 80% width = 1536px
 * - 25% width = 480px
 * - 75% width = 1440px
 */
export const PRESENTATION_LAYOUT = {
  total: {
    width: 1920,
    height: 1080,
  },
  horizontalSplit: {
    demo: { width: 480, height: 1080 },
    inspector: { width: 1440, height: 1080 },
  },
  horizontalSplitNarrow: {
    demo: { width: 384, height: 1080 },
    inspector: { width: 1536, height: 1080 },
  },
  verticalSplitTop: {
    demo: { width: 1920, height: 108 },
    inspector: { width: 1920, height: 972 },
  },
  verticalSplitBottom: {
    inspector: { width: 1920, height: 680 },
    demo: { width: 1920, height: 400 },
  },
} as const;

/**
 * Get canvas dimensions for a given layout mode
 */
export function getCanvasDimensionsForLayout(mode: LayoutMode) {
  switch (mode) {
    case 'horizontal-split':
      return PRESENTATION_LAYOUT.horizontalSplit.demo;
    case 'horizontal-split-narrow':
      return PRESENTATION_LAYOUT.horizontalSplitNarrow.demo;
    case 'vertical-split-top':
      return PRESENTATION_LAYOUT.verticalSplitTop.demo;
    case 'vertical-split-bottom':
      return PRESENTATION_LAYOUT.verticalSplitBottom.demo;
  }
}

/**
 * Story Canvas Configuration
 *
 * Default canvas dimensions set to 1920x1080 for all stories
 * This ensures consistent full HD canvas size even when stories
 * only use a portion of the canvas space.
 */
export const STORY_CANVAS = {
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  // Aliases for backward compatibility
  width: 1920,
  height: 1080,
} as const;

interface StoryCanvasDimensions {
  splitOrientation: SplitOrientation;
  canvasWidth: number;
  canvasHeight: number;
}

export function calculateStoryCanvasDimensions(
  splitOrientation: SplitOrientation,
  percent: number
): StoryCanvasDimensions {
  if (splitOrientation === 'horizontal') {
    return {
      splitOrientation: 'horizontal',
      canvasWidth: Math.floor((STORY_CANVAS.MAX_WIDTH * percent) / 100),
      canvasHeight: STORY_CANVAS.MAX_HEIGHT,
    };
  } else {
    return {
      splitOrientation: 'vertical',
      canvasWidth: STORY_CANVAS.MAX_WIDTH,
      canvasHeight: Math.floor((STORY_CANVAS.MAX_HEIGHT * percent) / 100),
    };
  }
}

// export const STORY_CANVAS_PERCENT = {
//   calcWidth: (percent: number) =>
//     Math.floor((STORY_CANVAS.MAX_WIDTH * percent) / 100),
//   calcHeight: (percent: number) =>
//     Math.floor((STORY_CANVAS.MAX_HEIGHT * percent) / 100),
// } as const;

/**
 * Actor dimensions
 */
export const ACTOR_SIZE = {
  hen: { width: 120, height: 120 },
  chef: { width: 344, height: 344 }, // Actual sprite size
  egg: { width: 60, height: 60 },
} as const;

/**
 * Stage padding/margins for animated content
 *
 * Creates visual breathing room within stage boundaries:
 * - BOTTOM_STAGE_PADDING: Distance from bottom edge where actors land/rest
 *   Currently set to 55px to account for egg landing position:
 *   - 25px visual padding from bottom edge
 *   - 30px egg radius (half of 60px egg height)
 */
export const STAGE_PADDING = {
  BOTTOM: 55, // Bottom edge padding for landing positions
} as const;

/**
 * Egg landing position offset from bottom
 *
 * Distance from canvas bottom where eggs should land/splat.
 * Used across multiple egg stories (splat, falling, etc.)
 * Higher value = egg lands farther from bottom
 */
export const EGG_LANDING_Y_OFFSET = 100; // pixels from bottom

/**
 * Edge margin (distance from canvas edge)
 */
const EDGE_MARGIN = 50;

/**
 * Calculate positioning for a given actor size and canvas width
 */
function calculatePositioning(actorWidth: number, actorHeight: number) {
  return {
    centerX: Math.floor(STORY_CANVAS.MAX_WIDTH / 2 - actorWidth / 2),
    centerY: Math.floor(STORY_CANVAS.MAX_HEIGHT / 2 - actorHeight / 2),
    leftEdge: EDGE_MARGIN,
    rightEdge: STORY_CANVAS.MAX_WIDTH - actorWidth - EDGE_MARGIN,
  };
}

/**
 * Calculate positioning for a given actor size and custom canvas dimensions
 * Use this for runtime position calculation when canvas size changes
 */
export function calculatePositioningForWidth(
  actorWidth: number,
  actorHeight: number,
  canvasWidth: number,
  canvasHeight: number = STORY_CANVAS.MAX_HEIGHT
) {
  return {
    centerX: Math.floor(canvasWidth / 2 - actorWidth / 2),
    centerY: Math.floor(canvasHeight / 2 - actorHeight / 2),
    leftEdge: EDGE_MARGIN,
    rightEdge: canvasWidth - actorWidth - EDGE_MARGIN,
  };
}

/**
 * Hen story positioning (dynamically calculated)
 *
 * All positions automatically adjust based on STORY_CANVAS.width
 */
export const HEN_DEMO = {
  ...calculatePositioning(ACTOR_SIZE.hen.width, ACTOR_SIZE.hen.height),
  size: ACTOR_SIZE.hen,
} as const;

/**
 * Chef story positioning (dynamically calculated)
 */
export const CHEF_DEMO = {
  ...calculatePositioning(ACTOR_SIZE.chef.width, ACTOR_SIZE.chef.height),
  size: ACTOR_SIZE.chef,
  // Override centerY for chef (centered in 400px canvas for vertical-split-bottom)
  centerY: 200,
} as const;

/**
 * Egg story positioning (dynamically calculated)
 */
export const EGG_DEMO = {
  ...calculatePositioning(ACTOR_SIZE.egg.width, ACTOR_SIZE.egg.height),
  size: ACTOR_SIZE.egg,
  // Override centerY for egg (upper portion)
  centerY: 100,
} as const;
