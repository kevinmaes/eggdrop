/**
 * Story Config Constants
 *
 * Shared constants and re-exports for individual story configuration files.
 * This file centralizes imports to keep individual story configs clean.
 */

// Canvas height/width percent constants
export const HEN_STORY_CANVAS_HEIGHT_PERCENT = 10;
export const EGG_STORY_CANVAS_WIDTH_PERCENT = 15;
export const CHEF_STORY_CANVAS_HEIGHT_PERCENT = 37;

// Re-export from story-constants
export {
  calculatePositioningForWidth,
  ACTOR_SIZE,
  CHEF_POT_OFFSET,
  calculateStoryCanvasDimensions,
  getCenterX,
  getCenterY,
  getGroundY,
  getFallingStartY,
} from './story-constants';

// Re-export from storybuk-theme
export { STORYBUK_COLORS } from './storybuk-theme';

// Re-export types
export type { StoryConfig, ActorConfig } from './types';
