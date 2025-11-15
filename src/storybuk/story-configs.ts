import {
  calculatePositioningForWidth,
  ACTOR_SIZE,
  STORY_CANVAS,
} from './story-constants';

import type { StoryConfig, StoryConfigs } from './types';

/**
 * Storybuk Configurations
 *
 * Stories are organized by category (hen, chef, egg, combined) in arrays.
 * The array order determines the progression shown in the Storybuk.
 *
 * Each story config defines:
 * - actors: Array of actor configurations (type, versions, start position)
 * - background: Background rendering settings
 * - title: Display name for the demo
 * - description: Optional longer explanation
 * - inspector: Optional Stately Inspector integration settings
 *
 * Usage:
 * - Add new stories by adding entries to the category arrays
 * - Reorder stories by rearranging array items
 * - Insert intermediate stories anywhere in the progression
 * - Machine/component versions use descriptive names, not numbers
 */

/**
 * Get hen stories with calculated positions for given canvas width
 */
export function getHenStories(
  canvasWidth: number = STORY_CANVAS.width,
  canvasHeight: number = STORY_CANVAS.height
): StoryConfig[] {
  const henPos = calculatePositioningForWidth(
    ACTOR_SIZE.hen.width,
    ACTOR_SIZE.hen.height,
    canvasWidth,
    canvasHeight
  );

  return [
    {
      id: 'Hen Idle',
      title: 'Hen - Idle',
      description:
        'Stationary hen in idle state (simplest possible demo) - Visual story + headless inspector',
      actors: [
        {
          type: 'hen',
          machineVersion: 'idle',
          componentVersion: 'idle',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-visual',
        },
        {
          type: 'hen',
          machineVersion: 'idle-headless',
          componentVersion: 'idle-headless',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-headless',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'vertical-split-top',
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'Hen Back And Forth',
      title: 'Hen - Back and Forth',
      description:
        'Visual story + headless inspector (for synchronized video recording)',
      actors: [
        {
          type: 'hen',
          machineVersion: 'back-and-forth',
          componentVersion: 'back-and-forth',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-visual',
        },
        {
          type: 'hen',
          machineVersion: 'back-and-forth-headless',
          componentVersion: 'back-and-forth-headless',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-headless',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'vertical-split-top',
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'Hen With Pauses',
      title: 'Hen - With Pauses',
      description:
        'Back and forth movement with 1-2 second pauses - Visual story + headless inspector',
      actors: [
        {
          type: 'hen',
          machineVersion: 'with-pauses',
          componentVersion: 'with-pauses',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-visual',
        },
        {
          type: 'hen',
          machineVersion: 'with-pauses-headless',
          componentVersion: 'with-pauses-headless',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-headless',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'vertical-split-top',
      inspector: { visible: true, position: 'right' },
    },
    // Future stories:
    // - hen-egg-laying: Add stationary egg-laying
    // - hen-moving-eggs: Add moving egg-laying
    // - hen-full: Production version with all features
  ];
}

/**
 * Get egg stories with calculated positions for given canvas width
 */
export function getEggStories(
  canvasWidth: number = STORY_CANVAS.width,
  canvasHeight: number = STORY_CANVAS.height
): StoryConfig[] {
  // Position eggs centered in the story canvas
  // Story canvas is 384px wide (20% of 1920px)

  // For eggs WITHOUT rotation (no offsetX/offsetY): position.x = left edge
  // Center the egg: (canvasWidth / 2) - (egg width / 2)
  const eggLeftEdgeCenterX = Math.floor(
    (canvasWidth - ACTOR_SIZE.egg.width) / 2
  );

  // For eggs WITH rotation (with offsetX/offsetY): position.x = center point
  // Simply use center of canvas
  const eggCenterPointX = Math.floor(canvasWidth / 2);

  const startY = 100; // Starting Y position (roughly where hen would be)

  return [
    {
      id: 'Egg Falling',
      title: 'Egg - Falling',
      description:
        'Egg falls straight down with gravity from top to bottom of screen - Visual story + headless inspector',
      actors: [
        {
          type: 'egg',
          machineVersion: 'falling',
          componentVersion: 'falling',
          startPosition: { x: eggLeftEdgeCenterX, y: startY },
          id: 'egg-visual',
        },
        {
          type: 'egg',
          machineVersion: 'falling-headless',
          componentVersion: 'falling-headless',
          startPosition: { x: eggLeftEdgeCenterX, y: startY },
          id: 'egg-headless',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'horizontal-split-narrow',
      inspector: {
        visible: true,
        position: 'right',
        statelyEmbedUrl:
          'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?machineId=101f821a-03c1-4af1-abbd-e54327548893',
      },
    },
    {
      id: 'Egg Falling Rotating',
      title: 'Egg - Falling + Rotating',
      description:
        'Egg falls with gravity AND rotates continuously (like in the game) - Visual story + headless inspector',
      actors: [
        {
          type: 'egg',
          machineVersion: 'falling-rotating',
          componentVersion: 'falling-rotating',
          startPosition: { x: eggCenterPointX, y: startY },
          id: 'egg-visual',
        },
        {
          type: 'egg',
          machineVersion: 'falling-rotating-headless',
          componentVersion: 'falling-rotating-headless',
          startPosition: { x: eggCenterPointX, y: startY },
          id: 'egg-headless',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'horizontal-split-narrow',
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'Egg Splat',
      title: 'Egg - Splat',
      description:
        'Egg falls and splats on the ground, showing broken egg sprite - Visual story + headless inspector',
      actors: [
        {
          type: 'egg',
          machineVersion: 'splat',
          componentVersion: 'splat',
          startPosition: { x: eggCenterPointX, y: startY },
          id: 'egg-visual',
        },
        {
          type: 'egg',
          machineVersion: 'splat-headless',
          componentVersion: 'splat-headless',
          startPosition: { x: eggCenterPointX, y: startY },
          id: 'egg-headless',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'horizontal-split-narrow',
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'Egg Fall Land Only',
      title: 'Egg - Falling and Landing',
      description:
        'Incremental demo: egg falls with rotation and lands - Shows physics and landing detection - Visual story + headless inspector',
      actors: [
        {
          type: 'egg',
          machineVersion: 'fall-land-only',
          componentVersion: 'fall-land-only',
          startPosition: { x: eggCenterPointX, y: startY },
          id: 'egg-visual',
        },
        {
          type: 'egg',
          machineVersion: 'fall-land-only-headless',
          componentVersion: 'fall-land-only-headless',
          startPosition: { x: eggCenterPointX, y: startY },
          id: 'egg-headless',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'horizontal-split-narrow',
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'Egg Land Hatch',
      title: 'Egg - Land and Hatch',
      description:
        'Incremental demo: egg falls and lands, shows chick in shell - Basic hatch transition without jump - Visual story + headless inspector',
      actors: [
        {
          type: 'egg',
          machineVersion: 'land-hatch',
          componentVersion: 'land-hatch',
          startPosition: { x: eggCenterPointX, y: startY },
          id: 'egg-visual',
        },
        {
          type: 'egg',
          machineVersion: 'land-hatch-headless',
          componentVersion: 'land-hatch-headless',
          startPosition: { x: eggCenterPointX, y: startY },
          id: 'egg-headless',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'horizontal-split-narrow',
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'Hatched Chick Exit',
      title: 'Hatched Chick - Exit',
      description:
        'Incremental demo: chick in shell transitions to running off - Shows exit animation without jump - Visual story + headless inspector',
      actors: [
        {
          type: 'egg',
          machineVersion: 'hatched-chick-exit',
          componentVersion: 'hatched-chick-exit',
          startPosition: { x: eggCenterPointX, y: canvasHeight - 80 },
          id: 'egg-visual',
        },
        {
          type: 'egg',
          machineVersion: 'hatched-chick-exit-headless',
          componentVersion: 'hatched-chick-exit-headless',
          startPosition: { x: eggCenterPointX, y: canvasHeight - 80 },
          id: 'egg-headless',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'horizontal-split-narrow',
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'Egg Hatch Jump Only',
      title: 'Egg - Hatching with Jump (Inserted Animation)',
      description:
        'Demonstrates inserting jump: egg lands, hatches, JUMPS, then exits - Shows how jump animation fits between hatch and exit - Visual story + headless inspector',
      actors: [
        {
          type: 'egg',
          machineVersion: 'hatch-jump-only',
          componentVersion: 'hatch-jump-only',
          startPosition: { x: eggCenterPointX, y: canvasHeight - 80 },
          id: 'egg-visual',
        },
        {
          type: 'egg',
          machineVersion: 'hatch-jump-only-headless',
          componentVersion: 'hatch-jump-only-headless',
          startPosition: { x: eggCenterPointX, y: canvasHeight - 80 },
          id: 'egg-headless',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'horizontal-split-narrow',
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'Egg Hatch Game Accurate',
      title: 'Egg - Complete Hatching (Game-Accurate)',
      description:
        'Full sequence matching real game: falls, hatches (300ms), jumps and bounces, pauses (500ms), runs off - Visual story + headless inspector',
      actors: [
        {
          type: 'egg',
          machineVersion: 'hatch-game-accurate',
          componentVersion: 'hatch-game-accurate',
          startPosition: { x: eggCenterPointX, y: startY },
          id: 'egg-visual',
        },
        {
          type: 'egg',
          machineVersion: 'hatch-game-accurate-headless',
          componentVersion: 'hatch-game-accurate-headless',
          startPosition: { x: eggCenterPointX, y: startY },
          id: 'egg-headless',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'horizontal-split-narrow',
      inspector: { visible: true, position: 'right' },
    },
  ];
}

/**
 * Get chef stories with custom canvas size for bottom presentation area
 */
export function getChefStories(): StoryConfig[] {
  // Chef stories use a custom canvas size: 1920x400 at bottom of presentation area
  const chefCanvasWidth = 1920;
  const chefCanvasHeight = 400;

  // Chef starts at center X (offsetX is handled in component via Konva)
  const chefCenterX = Math.floor(chefCanvasWidth / 2);
  // Position chef near the bottom with 20px margin from bottom edge
  // Canvas height is 400, chef height is 344, so position at 400 - 344 - 20 = 36
  const chefY = chefCanvasHeight - ACTOR_SIZE.chef.height - 20;

  return [
    {
      id: 'Chef Idle',
      title: 'Chef - Idle',
      description:
        'Stationary chef in idle state (simplest possible demo) - Visual story + headless inspector',
      actors: [
        {
          type: 'chef',
          machineVersion: 'idle',
          componentVersion: 'idle',
          startPosition: { x: chefCenterX, y: chefY },
          id: 'chef-visual',
        },
      ],
      background: {
        type: 'solid',
        color: '#2c5f7f',
      },
      layoutMode: 'vertical-split-bottom',
      canvasWidth: chefCanvasWidth,
      canvasHeight: chefCanvasHeight,
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'Chef Back And Forth',
      title: 'Chef - Moving',
      description:
        'Chef moves back and forth left to right - Visual story + headless inspector',
      actors: [
        {
          type: 'chef',
          machineVersion: 'back-and-forth',
          componentVersion: 'back-and-forth',
          startPosition: { x: chefCenterX, y: chefY },
          id: 'chef-visual',
        },
      ],
      background: {
        type: 'solid',
        color: '#2c5f7f',
      },
      layoutMode: 'vertical-split-bottom',
      canvasWidth: chefCanvasWidth,
      canvasHeight: chefCanvasHeight,
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'Chef Facing Direction',
      title: 'Chef - Face Forward',
      description:
        'Chef moves back and forth and faces the correct direction - Visual demo',
      actors: [
        {
          type: 'chef',
          machineVersion: 'facing-direction',
          componentVersion: 'facing-direction',
          startPosition: { x: chefCenterX, y: chefY },
          id: 'chef-visual',
        },
      ],
      background: {
        type: 'solid',
        color: '#2c5f7f',
      },
      layoutMode: 'vertical-split-bottom',
      canvasWidth: chefCanvasWidth,
      canvasHeight: chefCanvasHeight,
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'Chef With Pauses',
      title: 'Chef - Move + Stop',
      description:
        'Chef moves with random pauses and faces direction of movement - Visual demo',
      actors: [
        {
          type: 'chef',
          machineVersion: 'with-pauses',
          componentVersion: 'with-pauses',
          startPosition: { x: chefCenterX, y: chefY },
          id: 'chef-visual',
        },
      ],
      background: {
        type: 'solid',
        color: '#2c5f7f',
      },
      layoutMode: 'vertical-split-bottom',
      canvasWidth: chefCanvasWidth,
      canvasHeight: chefCanvasHeight,
      inspector: { visible: true, position: 'right' },
    },
  ];
}

/**
 * Get "Other" stories (misc stories like points, UI elements, etc.)
 */
export function getOtherStories(
  canvasWidth: number = STORY_CANVAS.width,
  canvasHeight: number = STORY_CANVAS.height
): StoryConfig[] {
  // Use horizontal-split-narrow layout like eggs (384px wide, 1080px tall)
  const demoCanvasWidth = 384;
  const demoCanvasHeight = 1080;

  const centerX = Math.floor(demoCanvasWidth / 2);
  const centerY = Math.floor(demoCanvasHeight / 2);

  return [
    {
      id: 'Other Egg Caught Points',
      title: 'Other - Egg Caught Points',
      description:
        'Points animation that appears when catching an egg - loops every 2 seconds',
      actors: [
        {
          type: 'egg-caught-points',
          machineVersion: 'demo',
          componentVersion: 'demo',
          startPosition: { x: centerX, y: centerY + 100 },
          id: 'egg-caught-points-white',
          eggColor: 'white',
        },
        {
          type: 'egg-caught-points',
          machineVersion: 'demo',
          componentVersion: 'demo',
          startPosition: { x: centerX, y: centerY - 100 },
          id: 'egg-caught-points-gold',
          eggColor: 'gold',
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'horizontal-split-narrow',
      canvasWidth: demoCanvasWidth,
      canvasHeight: demoCanvasHeight,
      inspector: { visible: true, position: 'right' },
    },
  ];
}

/**
 * Get all story configs for given canvas dimensions
 */
export function getStoryConfigs(
  canvasWidth: number = STORY_CANVAS.width,
  canvasHeight: number = STORY_CANVAS.height
): StoryConfigs {
  const henStories = getHenStories(canvasWidth, canvasHeight);
  const eggStories = getEggStories(canvasWidth, canvasHeight);
  const chefStories = getChefStories();
  const otherStories = getOtherStories(canvasWidth, canvasHeight);

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
