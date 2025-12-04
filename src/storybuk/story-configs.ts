// Import individual story configs

import { storyConfig as chefBackAndForthConfig } from './stories/chef-back-and-forth/story-config';
import { storyConfig as chefCatchWithPointsConfig } from './stories/chef-catch-with-points/story-config';
import { storyConfig as chefFacingDirectionConfig } from './stories/chef-facing-direction/story-config';
import { storyConfig as chefIdleConfig } from './stories/chef-idle/story-config';
import { storyConfig as chefWithPausesConfig } from './stories/chef-with-pauses/story-config';
import { storyConfig as eggCaughtPointsConfig } from './stories/egg-caught-points-demo/story-config';
import { storyConfig as eggFallLandOnlyConfig } from './stories/egg-fall-land-only/story-config';
import { storyConfig as eggFallingConfig } from './stories/egg-falling/story-config';
import { storyConfig as eggFallingAndBreakingConfig } from './stories/egg-falling-and-breaking/story-config';
import { storyConfig as eggFallingRotatingConfig } from './stories/egg-falling-rotating/story-config';
import { storyConfig as eggHatchGameAccurateConfig } from './stories/egg-hatch-game-accurate/story-config';
import { storyConfig as eggHatchJumpOnlyConfig } from './stories/egg-hatch-jump-only/story-config';
import { storyConfig as eggIdleConfig } from './stories/egg-idle/story-config';
import { storyConfig as eggLandHatchConfig } from './stories/egg-land-hatch/story-config';
import { storyConfig as eggLandHatchExitConfig } from './stories/egg-land-hatch-exit/story-config';
import { storyConfig as gameCompleteDemoConfig } from './stories/game-complete-demo/story-config';
import { storyConfig as hatchedStandExitConfig } from './stories/hatched-stand-exit/story-config';
import { storyConfig as henBackAndForthConfig } from './stories/hen-back-and-forth/story-config';
import { storyConfig as henChefCatchConfig } from './stories/hen-chef-catch/story-config';
import { storyConfig as henEggLayingConfig } from './stories/hen-egg-laying/story-config';
import { storyConfig as henIdleConfig } from './stories/hen-idle/story-config';
import { storyConfig as henLayingFallingEggConfig } from './stories/hen-laying-falling-egg/story-config';
import { storyConfig as henLayingWithEggConfig } from './stories/hen-laying-with-egg/story-config';
import { storyConfig as henSpawningEggConfig } from './stories/hen-spawning-egg/story-config';
import { storyConfig as henWithPausesConfig } from './stories/hen-with-pauses/story-config';

import type { StoryConfig, StoryConfigs } from './types';

/**
 * Ordered arrays of stories by character type - this is the source of truth for display order
 * Each array explicitly defines which stories belong to each character group
 */
export const henStories: StoryConfig[] = [
  henIdleConfig,
  henBackAndForthConfig,
  henWithPausesConfig,
  henEggLayingConfig,
  henLayingWithEggConfig,
  henLayingFallingEggConfig,
  henSpawningEggConfig,
];

export const eggStories: StoryConfig[] = [
  eggIdleConfig,
  eggFallingConfig,
  eggFallingRotatingConfig,
  eggFallLandOnlyConfig,
  eggFallingAndBreakingConfig,
  eggLandHatchConfig,
  hatchedStandExitConfig, // 14
  eggLandHatchExitConfig, // 15
  eggHatchJumpOnlyConfig, // 16
  eggHatchGameAccurateConfig, // 17
];

export const chefStories: StoryConfig[] = [
  chefIdleConfig,
  chefBackAndForthConfig,
  chefFacingDirectionConfig,
  chefWithPausesConfig,
  henChefCatchConfig,
  chefCatchWithPointsConfig,
];

export const otherStories: StoryConfig[] = [
  eggCaughtPointsConfig,
  gameCompleteDemoConfig,
];

/**
 * Ordered array of all stories - use this for display order
 */
export const allStoriesOrdered: StoryConfig[] = [
  ...henStories,
  ...eggStories,
  ...chefStories,
  ...otherStories,
];

/**
 * Get all story configs as a Record for ID-based lookups
 */
export function getStoryConfigs(): StoryConfigs {
  return Object.fromEntries(allStoriesOrdered.map((d) => [d.id, d]));
}

/**
 * Default story configs (for backwards compatibility)
 */
export const storyConfigs = getStoryConfigs();
