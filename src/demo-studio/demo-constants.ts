/**
 * Demo Studio Constants
 *
 * Shared constants for demo configurations to ensure consistency
 * across all demos of the same actor type.
 */

/**
 * Stage dimensions (matches game config)
 */
export const STAGE = {
  width: 1280,
  height: 720,
} as const;

/**
 * Hen demo positioning
 *
 * Consistent positioning for all hen-based demos.
 * Y position centers the hen vertically on the stage.
 */
export const HEN_DEMO = {
  // Vertical center: (720 / 2) - (120 / 2) = 300
  centerY: 300,
  // Horizontal positions for different demo scenarios
  centerX: 580, // Center: (1280 / 2) - (120 / 2)
  leftEdge: 50,
  rightEdge: 1110, // 1280 - 120 - 50
} as const;

/**
 * Future: Chef demo positioning
 */
export const CHEF_DEMO = {
  centerY: 600, // Bottom third of stage
  centerX: 640,
} as const;

/**
 * Future: Egg demo positioning
 */
export const EGG_DEMO = {
  centerY: 100, // Upper portion of stage
  centerX: 640,
} as const;
