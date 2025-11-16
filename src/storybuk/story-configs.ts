import {
  calculatePositioningForWidth,
  ACTOR_SIZE,
  calculateStoryCanvasDimensions,
} from './story-constants';
import { STORYBUK_COLORS } from './storybuk-theme';

import type { StoryConfig, StoryConfigs, ActorConfig } from './types';

/**
 * Storybuk Configurations
 *
 * Stories are organized by category (hen, chef, egg, combined) as static constants.
 * The array order determines the progression shown in the Storybuk.
 *
 * Each story config defines:
 * - actors: Array of actor configurations (type, versions, start position)
 * - background: Background rendering settings
 * - title: Display name for the demo
 * - description: Optional longer explanation
 * - statelyEmbedUrl: Optional URL for embedded Stately state chart diagram
 *
 * Usage:
 * - Add new stories by adding entries to the category arrays
 * - Reorder stories by rearranging array items
 * - Insert intermediate stories anywhere in the progression
 * - Machine/component versions use descriptive names, not numbers
 *
 * Position Calculation:
 * - Actor startPositions use placeholder values (0, 0)
 * - Actual positions are calculated dynamically by applyPositions()
 * - This keeps configs static while allowing dynamic canvas sizing
 */

const HEN_STORY_CANVAS_HEIGHT_PERCENT = 10;

/**
 * Hen Stories - Stationary hen in various states
 */
const HEN_STORIES: Omit<StoryConfig, 'actors'>[] &
  { actors: Omit<ActorConfig, 'startPosition'>[] }[] = [
  {
    id: 'Hen Idle',
    type: 'static',
    title: 'Hen - Idle',
    description:
      'Stationary hen in idle state (simplest possible demo) - Visual story + headless inspector',
    actors: [
      {
        type: 'hen',
        machineVersion: 'idle',
        componentVersion: 'idle',
        id: 'hen-visual',
      },
      {
        type: 'hen',
        machineVersion: 'idle-headless',
        componentVersion: 'idle-headless',
        id: 'hen-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'vertical-split-top',
    ...calculateStoryCanvasDimensions(
      'vertical',
      HEN_STORY_CANVAS_HEIGHT_PERCENT
    ),
  },
  {
    id: 'Hen Back And Forth',
    type: 'animated',
    title: 'Hen - Back and Forth',
    description:
      'Visual story + headless inspector (for synchronized video recording)',
    actors: [
      {
        type: 'hen',
        machineVersion: 'back-and-forth',
        componentVersion: 'back-and-forth',
        id: 'hen-visual',
      },
      {
        type: 'hen',
        machineVersion: 'back-and-forth-headless',
        componentVersion: 'back-and-forth-headless',
        id: 'hen-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'vertical-split-top',
    ...calculateStoryCanvasDimensions(
      'vertical',
      HEN_STORY_CANVAS_HEIGHT_PERCENT
    ),
  },
  {
    id: 'Hen With Pauses',
    type: 'animated',
    title: 'Hen - With Pauses',
    description:
      'Back and forth movement with 1-2 second pauses - Visual story + headless inspector',
    actors: [
      {
        type: 'hen',
        machineVersion: 'with-pauses',
        componentVersion: 'with-pauses',
        id: 'hen-visual',
      },
      {
        type: 'hen',
        machineVersion: 'with-pauses-headless',
        componentVersion: 'with-pauses-headless',
        id: 'hen-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'vertical-split-top',
    ...calculateStoryCanvasDimensions(
      'vertical',
      HEN_STORY_CANVAS_HEIGHT_PERCENT
    ),
  },
  // Future stories:
  // - hen-egg-laying: Add stationary egg-laying
  // - hen-moving-eggs: Add moving egg-laying
  // - hen-full: Production version with all features
];

const EGG_STORY_CANVAS_WIDTH_PERCENT = 15;

/**
 * Egg Stories - Falling eggs with various physics and hatching behaviors
 */
const EGG_STORIES: Omit<StoryConfig, 'actors'>[] &
  { actors: Omit<ActorConfig, 'startPosition'>[] }[] = [
  {
    id: 'EggIdle',
    type: 'static',
    title: 'Egg - Idle',
    description: 'Shows a stationary egg for reference',
    actors: [
      {
        type: 'egg',
        machineVersion: 'idle',
        componentVersion: 'idle',
        id: 'egg-visual',
      },
      {
        type: 'egg',
        machineVersion: 'idle-headless',
        componentVersion: 'idle-headless',
        id: 'egg-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'horizontal-split-narrow',
    ...calculateStoryCanvasDimensions(
      'horizontal',
      EGG_STORY_CANVAS_WIDTH_PERCENT
    ),
    statelyEmbedUrl:
      'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?machineId=egg-idle&mode=design',
  },
  {
    id: 'Egg Falling',
    type: 'animated',
    title: 'Egg - Falling',
    description:
      'Egg falls straight down with gravity from top to bottom of screen - Visual story + headless inspector',
    actors: [
      {
        type: 'egg',
        machineVersion: 'falling',
        componentVersion: 'falling',
        id: 'egg-visual',
      },
      {
        type: 'egg',
        machineVersion: 'falling-headless',
        componentVersion: 'falling-headless',
        id: 'egg-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'horizontal-split-narrow',
    ...calculateStoryCanvasDimensions(
      'horizontal',
      EGG_STORY_CANVAS_WIDTH_PERCENT
    ),
    statelyEmbedUrl:
      'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?machineId=67ee088f-7005-4919-a155-673965bfef40&mode=design',
  },
  {
    id: 'Egg Falling Rotating',
    type: 'animated',
    title: 'Egg - Falling + Rotating',
    description:
      'Egg falls with gravity AND rotates continuously (like in the game) - Visual story + headless inspector',
    actors: [
      {
        type: 'egg',
        machineVersion: 'falling-rotating',
        componentVersion: 'falling-rotating',
        id: 'egg-visual',
      },
      {
        type: 'egg',
        machineVersion: 'falling-rotating-headless',
        componentVersion: 'falling-rotating-headless',
        id: 'egg-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'horizontal-split-narrow',
    ...calculateStoryCanvasDimensions(
      'horizontal',
      EGG_STORY_CANVAS_WIDTH_PERCENT
    ),
  },
  {
    id: 'Egg Splat',
    type: 'animated',
    title: 'Egg - Splat',
    description:
      'Egg falls and splats on the ground, showing broken egg sprite - Visual story + headless inspector',
    actors: [
      {
        type: 'egg',
        machineVersion: 'splat',
        componentVersion: 'splat',
        id: 'egg-visual',
      },
      {
        type: 'egg',
        machineVersion: 'splat-headless',
        componentVersion: 'splat-headless',
        id: 'egg-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'horizontal-split-narrow',
    ...calculateStoryCanvasDimensions(
      'horizontal',
      EGG_STORY_CANVAS_WIDTH_PERCENT
    ),
  },
  {
    id: 'Egg Fall Land Only',
    type: 'animated',
    title: 'Egg - Falling and Landing',
    description:
      'Incremental demo: egg falls with rotation and lands - Shows physics and landing detection - Visual story + headless inspector',
    actors: [
      {
        type: 'egg',
        machineVersion: 'fall-land-only',
        componentVersion: 'fall-land-only',
        id: 'egg-visual',
      },
      {
        type: 'egg',
        machineVersion: 'fall-land-only-headless',
        componentVersion: 'fall-land-only-headless',
        id: 'egg-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'horizontal-split-narrow',
    ...calculateStoryCanvasDimensions(
      'horizontal',
      EGG_STORY_CANVAS_WIDTH_PERCENT
    ),
  },
  {
    id: 'Egg Land Hatch',
    type: 'animated',
    title: 'Egg - Land and Hatch',
    description:
      'Incremental demo: egg falls and lands, shows chick in shell - Basic hatch transition without jump - Visual story + headless inspector',
    actors: [
      {
        type: 'egg',
        machineVersion: 'land-hatch',
        componentVersion: 'land-hatch',
        id: 'egg-visual',
      },
      {
        type: 'egg',
        machineVersion: 'land-hatch-headless',
        componentVersion: 'land-hatch-headless',
        id: 'egg-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'horizontal-split-narrow',
    ...calculateStoryCanvasDimensions(
      'horizontal',
      EGG_STORY_CANVAS_WIDTH_PERCENT
    ),
  },
  {
    id: 'Hatched Chick Exit',
    type: 'animated',
    title: 'Hatched Chick - Exit',
    description:
      'Incremental demo: chick in shell transitions to running off - Shows exit animation without jump - Visual story + headless inspector',
    actors: [
      {
        type: 'egg',
        machineVersion: 'hatched-chick-exit',
        componentVersion: 'hatched-chick-exit',
        id: 'egg-visual',
      },
      {
        type: 'egg',
        machineVersion: 'hatched-chick-exit-headless',
        componentVersion: 'hatched-chick-exit-headless',
        id: 'egg-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'horizontal-split-narrow',
    ...calculateStoryCanvasDimensions(
      'horizontal',
      EGG_STORY_CANVAS_WIDTH_PERCENT
    ),
  },
  {
    id: 'Egg Hatch Jump Only',
    type: 'animated',
    title: 'Egg - Hatching with Jump (Inserted Animation)',
    description:
      'Demonstrates inserting jump: egg lands, hatches, JUMPS, then exits - Shows how jump animation fits between hatch and exit - Visual story + headless inspector',
    actors: [
      {
        type: 'egg',
        machineVersion: 'hatch-jump-only',
        componentVersion: 'hatch-jump-only',
        id: 'egg-visual',
      },
      {
        type: 'egg',
        machineVersion: 'hatch-jump-only-headless',
        componentVersion: 'hatch-jump-only-headless',
        id: 'egg-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'horizontal-split-narrow',
    ...calculateStoryCanvasDimensions(
      'horizontal',
      EGG_STORY_CANVAS_WIDTH_PERCENT
    ),
  },
  {
    id: 'Egg Hatch Game Accurate',
    type: 'animated',
    title: 'Egg - Complete Hatching (Game-Accurate)',
    description:
      'Full sequence matching real game: falls, hatches (300ms), jumps and bounces, pauses (500ms), runs off - Visual story + headless inspector',
    actors: [
      {
        type: 'egg',
        machineVersion: 'hatch-game-accurate',
        componentVersion: 'hatch-game-accurate',
        id: 'egg-visual',
      },
      {
        type: 'egg',
        machineVersion: 'hatch-game-accurate-headless',
        componentVersion: 'hatch-game-accurate-headless',
        id: 'egg-headless',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'horizontal-split-narrow',
    ...calculateStoryCanvasDimensions(
      'horizontal',
      EGG_STORY_CANVAS_WIDTH_PERCENT
    ),
  },
];

const CHEF_STORY_CANVAS_HEIGHT_PERCENT = 37;

/**
 * Chef Stories - Chef movement and behavior demos
 */
const CHEF_STORIES: StoryConfig[] = [
  {
    id: 'Chef Idle',
    type: 'static',
    title: 'Chef - Idle',
    description:
      'Stationary chef in idle state (simplest possible demo) - Visual story + headless inspector',
    actors: [
      {
        type: 'chef',
        machineVersion: 'idle',
        componentVersion: 'idle',
        startPosition: { x: 960, y: 36 }, // Center X, positioned near bottom
        id: 'chef-visual',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'vertical-split-bottom',
    ...calculateStoryCanvasDimensions(
      'vertical',
      CHEF_STORY_CANVAS_HEIGHT_PERCENT
    ),
  },
  {
    id: 'Chef Back And Forth',
    type: 'animated',
    title: 'Chef - Moving',
    description:
      'Chef moves back and forth left to right - Visual story + headless inspector',
    actors: [
      {
        type: 'chef',
        machineVersion: 'back-and-forth',
        componentVersion: 'back-and-forth',
        startPosition: { x: 960, y: 36 },
        id: 'chef-visual',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'vertical-split-bottom',
    ...calculateStoryCanvasDimensions(
      'vertical',
      CHEF_STORY_CANVAS_HEIGHT_PERCENT
    ),
  },
  {
    id: 'Chef Facing Direction',
    type: 'animated',
    title: 'Chef - Face Forward',
    description:
      'Chef moves back and forth and faces the correct direction - Visual demo',
    actors: [
      {
        type: 'chef',
        machineVersion: 'facing-direction',
        componentVersion: 'facing-direction',
        startPosition: { x: 960, y: 36 },
        id: 'chef-visual',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'vertical-split-bottom',
    ...calculateStoryCanvasDimensions(
      'vertical',
      CHEF_STORY_CANVAS_HEIGHT_PERCENT
    ),
  },
  {
    id: 'Chef With Pauses',
    type: 'animated',
    title: 'Chef - Move + Stop',
    description:
      'Chef moves with random pauses and faces direction of movement - Visual demo',
    actors: [
      {
        type: 'chef',
        machineVersion: 'with-pauses',
        componentVersion: 'with-pauses',
        startPosition: { x: 960, y: 36 },
        id: 'chef-visual',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'vertical-split-bottom',
    ...calculateStoryCanvasDimensions(
      'vertical',
      CHEF_STORY_CANVAS_HEIGHT_PERCENT
    ),
  },
];

/**
 * Other Stories - Misc UI elements, points, etc.
 */
const OTHER_STORIES: StoryConfig[] = [
  {
    id: 'Other Egg Caught Points',
    type: 'animated',
    title: 'Other - Egg Caught Points',
    description:
      'Points animation that appears when catching an egg - loops every 2 seconds',
    actors: [
      {
        type: 'egg-caught-points',
        machineVersion: 'demo',
        componentVersion: 'demo',
        startPosition: { x: 192, y: 640 }, // centerX, centerY + 100
        id: 'egg-caught-points-white',
        eggColor: 'white',
      },
      {
        type: 'egg-caught-points',
        machineVersion: 'demo',
        componentVersion: 'demo',
        startPosition: { x: 192, y: 440 }, // centerX, centerY - 100
        id: 'egg-caught-points-gold',
        eggColor: 'gold',
      },
    ],
    background: {
      type: 'solid',
      color: STORYBUK_COLORS.storyDemoBackground,
    },
    layoutMode: 'horizontal-split-narrow',
    ...calculateStoryCanvasDimensions('horizontal', 20),
  },
];

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
  const henStories = HEN_STORIES.map((story) =>
    applyPositionsToStory(story, story.canvasWidth, story.canvasHeight, 'hen')
  );
  const eggStories = EGG_STORIES.map((story) =>
    applyPositionsToStory(story, story.canvasWidth, story.canvasHeight, 'egg')
  );

  // Chef and Other stories have static positions
  const chefStories = CHEF_STORIES;
  const otherStories = OTHER_STORIES;

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
