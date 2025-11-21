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
import { storyConfig as henEggLayingConfig } from './stories/hen-egg-laying/story-config';
import { storyConfig as henIdleConfig } from './stories/hen-idle/story-config';
import { storyConfig as henLayingFallingEggConfig } from './stories/hen-laying-falling-egg/story-config';
import { storyConfig as henLayingWithEggConfig } from './stories/hen-laying-with-egg/story-config';
import { storyConfig as henWithPausesConfig } from './stories/hen-with-pauses/story-config';

import type { StoryConfigs } from './types';

/**
 * Get all story configs with dynamically calculated positions
 */
export function getStoryConfigs(): StoryConfigs {
  // All stories now have positions defined in their config files
  const henStories = [
    henIdleConfig,
    henBackAndForthConfig,
    henWithPausesConfig,
    henEggLayingConfig,
    henLayingWithEggConfig,
    henLayingFallingEggConfig,
  ];

  const eggStories = [
    eggIdleConfig,
    eggFallingConfig,
    eggFallingRotatingConfig,
    eggFallLandOnlyConfig,
    eggSplatConfig,
    eggLandHatchConfig,
    hatchedChickExitConfig,
    eggHatchJumpOnlyConfig,
    eggHatchGameAccurateConfig,
  ];

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
