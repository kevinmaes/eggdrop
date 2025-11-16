

// Import individual story configs


import { storyConfig as chefBackAndForthConfig } from './stories/chef-back-and-forth/story-config';
import { storyConfig as chefFacingDirectionConfig } from './stories/chef-facing-direction/story-config';
import { storyConfig as chefIdleConfig } from './stories/chef-idle/story-config';
import { storyConfig as chefWithPausesConfig } from './stories/chef-with-pauses/story-config';
import { storyConfig as eggCaughtPointsConfig } from './stories/egg-caught-points-demo/story-config';
import { storyConfig as eggFallLandOnlyConfig } from './stories/egg-fall-land-only/story-config';
import { storyConfig as eggFallingConfig } from './stories/egg-falling/story-config';
import { storyConfig as eggFallingRotatingConfig } from './stories/egg-falling-rotating/story-config';
import { storyConfig as eggHatchGameAccurateConfig } from './stories/egg-hatch-game-accurate/story-config';
import { storyConfig as eggHatchJumpOnlyConfig } from './stories/egg-hatch-jump-only/story-config';
import { storyConfig as eggIdleConfig } from './stories/egg-idle/story-config';
import { storyConfig as eggLandHatchConfig } from './stories/egg-land-hatch/story-config';
import { storyConfig as eggSplatConfig } from './stories/egg-splat/story-config';
import { storyConfig as hatchedChickExitConfig } from './stories/hatched-chick-exit/story-config';
import { storyConfig as henBackAndForthConfig } from './stories/hen-back-and-forth/story-config';
import { storyConfig as henIdleConfig } from './stories/hen-idle/story-config';
import { storyConfig as henWithPausesConfig } from './stories/hen-with-pauses/story-config';
import { calculatePositioningForWidth, ACTOR_SIZE } from './story-constants';

import type { StoryConfig, StoryConfigs } from './types';

/**
 * Storybuk Configurations
 *
 * Story configs are now defined in individual files within each story folder.
 * This file aggregates them and applies dynamic position calculations.
 *
 * Position Calculation:
 * - Actor startPositions use placeholder values (0, 0) in hen/egg stories
 * - Actual positions are calculated dynamically by applyPositions()
 * - This keeps configs static while allowing dynamic canvas sizing
 */

/**
 * Helper function to apply dynamic position calculations to stories
 */
function applyPositionsToStory(
  story: any,
  canvasWidth: number,
  canvasHeight: number,
  actorType: 'hen' | 'egg' | 'other'
): StoryConfig {
  if (actorType === 'hen') {
    const henPos = calculatePositioningForWidth(
      ACTOR_SIZE.hen.width,
      ACTOR_SIZE.hen.height,
      canvasWidth,
      canvasHeight
    );

    return {
      ...story,
      actors: story.actors.map((actor: any) => ({
        ...actor,
        startPosition: { x: henPos.centerX, y: henPos.centerY },
      })),
    };
  }

  if (actorType === 'egg') {
    // For eggs WITHOUT rotation (no offsetX/offsetY): position.x = left edge
    const eggLeftEdgeCenterX = Math.floor(
      (canvasWidth - ACTOR_SIZE.egg.width) / 2
    );

    // For eggs WITH rotation (with offsetX/offsetY): position.x = center point
    const eggCenterPointX = Math.floor(canvasWidth / 2);

    const startY = 510; // Starting Y position (middle of canvas)

    // Determine which position type to use based on machine version
    const useCenterPoint = [
      'falling-rotating',
      'splat',
      'fall-land-only',
      'land-hatch',
      'hatch-jump-only',
      'hatch-game-accurate',
    ].some((version) =>
      story.actors.some((a: any) => a.machineVersion.includes(version))
    );

    const posX = useCenterPoint ? eggCenterPointX : eggLeftEdgeCenterX;

    // Eggs WITHOUT offset (just "falling") need Y adjusted by half egg height
    // to visually align with eggs that have offsetY={EGG_SIZE.height / 2}
    const usesOffset = useCenterPoint;
    const posY = usesOffset ? startY : startY - ACTOR_SIZE.egg.height / 2;

    return {
      ...story,
      actors: story.actors.map((actor: any) => ({
        ...actor,
        startPosition: { x: posX, y: posY },
      })),
    };
  }

  // For 'other' type, positions are already set in the static config
  return story as StoryConfig;
}

/**
 * Get all story configs with dynamically calculated positions
 */
export function getStoryConfigs(): StoryConfigs {
  // Apply positions to hen and egg stories
  const henStories = [
    henIdleConfig,
    henBackAndForthConfig,
    henWithPausesConfig,
  ].map((story) =>
    applyPositionsToStory(story, story.canvasWidth, story.canvasHeight, 'hen')
  );

  const eggStories = [
    eggIdleConfig,
    eggFallingConfig,
    eggFallingRotatingConfig,
    eggSplatConfig,
    eggFallLandOnlyConfig,
    eggLandHatchConfig,
    hatchedChickExitConfig,
    eggHatchJumpOnlyConfig,
    eggHatchGameAccurateConfig,
  ].map((story) =>
    applyPositionsToStory(story, story.canvasWidth, story.canvasHeight, 'egg')
  );

  // Chef and Other stories have static positions
  const chefStories = [
    chefIdleConfig,
    chefBackAndForthConfig,
    chefFacingDirectionConfig,
    chefWithPausesConfig,
  ];
  const otherStories = [eggCaughtPointsConfig];

  return {
    ...Object.fromEntries(henStories.map((d) => [d.id, d])),
    ...Object.fromEntries(eggStories.map((d) => [d.id, d])),
    ...Object.fromEntries(chefStories.map((d) => [d.id, d])),
    ...Object.fromEntries(otherStories.map((d) => [d.id, d])),
  };
}

/**
 * Default story configs (for backwards compatibility)
 */
export const storyConfigs = getStoryConfigs();
