/**
 * Demo Studio Constants
 *
 * Shared constants for demo configurations to ensure consistency
 * across all demos of the same actor type.
 *
 * All positioning is calculated dynamically based on DEMO_CANVAS dimensions.
 * Change DEMO_CANVAS.width to adjust all demos (e.g., half width = 640).
 */

/**
 * Presentation Layout Modes
 *
 * Optimized layouts for 1920x1080 presentation recording:
 * - horizontal-split: Demo on left (25%), Inspector on right (75%)
 * - horizontal-split-narrow: Demo on left (20%), Inspector on right (80%)
 * - vertical-split-top: Demo on top (10%), Inspector on bottom (90%)
 * - vertical-split-bottom: Inspector on top (90%), Demo on bottom (10%)
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
    inspector: { width: 1920, height: 580 },
    demo: { width: 1920, height: 500 },
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
 * Demo Canvas Configuration
 *
 * Default canvas dimensions set to 1920x1080 for all demos
 * This ensures consistent full HD canvas size even when demos
 * only use a portion of the canvas space.
 */
export const DEMO_CANVAS = {
  width: 1920,
  height: 1080,
} as const;

/**
 * Actor dimensions
 */
export const ACTOR_SIZE = {
  hen: { width: 120, height: 120 },
  chef: { width: 344, height: 344 }, // Actual sprite size
  egg: { width: 60, height: 60 },
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
    centerX: Math.floor(DEMO_CANVAS.width / 2 - actorWidth / 2),
    centerY: Math.floor(DEMO_CANVAS.height / 2 - actorHeight / 2),
    leftEdge: EDGE_MARGIN,
    rightEdge: DEMO_CANVAS.width - actorWidth - EDGE_MARGIN,
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
  canvasHeight: number = DEMO_CANVAS.height
) {
  return {
    centerX: Math.floor(canvasWidth / 2 - actorWidth / 2),
    centerY: Math.floor(canvasHeight / 2 - actorHeight / 2),
    leftEdge: EDGE_MARGIN,
    rightEdge: canvasWidth - actorWidth - EDGE_MARGIN,
  };
}

/**
 * Hen demo positioning (dynamically calculated)
 *
 * All positions automatically adjust based on DEMO_CANVAS.width
 */
export const HEN_DEMO = {
  ...calculatePositioning(ACTOR_SIZE.hen.width, ACTOR_SIZE.hen.height),
  size: ACTOR_SIZE.hen,
} as const;

/**
 * Chef demo positioning (dynamically calculated)
 */
export const CHEF_DEMO = {
  ...calculatePositioning(ACTOR_SIZE.chef.width, ACTOR_SIZE.chef.height),
  size: ACTOR_SIZE.chef,
  // Override centerY for chef (bottom third)
  centerY: Math.floor((DEMO_CANVAS.height * 2) / 3),
} as const;

/**
 * Egg demo positioning (dynamically calculated)
 */
export const EGG_DEMO = {
  ...calculatePositioning(ACTOR_SIZE.egg.width, ACTOR_SIZE.egg.height),
  size: ACTOR_SIZE.egg,
  // Override centerY for egg (upper portion)
  centerY: 100,
} as const;
