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
 * Demo Canvas Configuration
 *
 * Adjust width here to change all demo dimensions.
 * Common options:
 * - Full width: 1280
 * - Half width: 640
 * - Two-thirds: 853
 * - Custom: any value
 */
export const DEMO_CANVAS = {
  width: 1280, // Change this to resize all demos
  height: 720,
} as const;

/**
 * Actor dimensions
 */
export const ACTOR_SIZE = {
  hen: { width: 120, height: 120 },
  chef: { width: 100, height: 100 },
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
