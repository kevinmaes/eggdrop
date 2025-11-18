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
import { STORYBUK_LAYOUT } from './storybuk-theme';

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
      canvasWidth: STORYBUK_LAYOUT.contentArea.width,
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
 * - BOTTOM: Distance from bottom edge where actors land/rest
 *   Set to 100px to provide comfortable spacing from bottom edge
 *   for egg landing, hatching, and chick animations
 */
export const STAGE_PADDING = {
  BOTTOM: 100, // Bottom edge padding for landing positions
} as const;

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
 * Position helper functions for story configs
 * Use these to calculate consistent positions across stories
 */

/**
 * Get horizontally centered X position for an actor
 * For actors with offsetX (like rotated eggs), returns canvas center
 * For actors without offset, returns left edge that centers the actor
 */
export function getCenterX(canvasWidth: number, actorWidth: number, usesOffset: boolean = false): number {
  if (usesOffset) {
    return Math.floor(canvasWidth / 2);
  }
  return Math.floor((canvasWidth - actorWidth) / 2);
}

/**
 * Get Y position for actor centered vertically
 */
export function getCenterY(canvasHeight: number, actorHeight: number): number {
  return Math.floor((canvasHeight - actorHeight) / 2);
}

/**
 * Get Y position for actor on ground (using STAGE_PADDING.BOTTOM)
 */
export function getGroundY(canvasHeight: number): number {
  return canvasHeight - STAGE_PADDING.BOTTOM;
}

/**
 * Get start Y position for falling eggs (middle of canvas)
 */
export function getFallingStartY(canvasHeight: number): number {
  return Math.floor(canvasHeight / 2);
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
