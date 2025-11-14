import {
  calculatePositioningForWidth,
  ACTOR_SIZE,
  DEMO_CANVAS,
} from './demo-constants';

import type { DemoConfig, DemoConfigs } from './types';

/**
 * Demo Studio Configurations
 *
 * Demos are organized by category (hen, chef, egg, combined) in arrays.
 * The array order determines the progression shown in the Demo Studio.
 *
 * Each demo config defines:
 * - actors: Array of actor configurations (type, versions, start position)
 * - background: Background rendering settings
 * - title: Display name for the demo
 * - description: Optional longer explanation
 * - inspector: Optional Stately Inspector integration settings
 *
 * Usage:
 * - Add new demos by adding entries to the category arrays
 * - Reorder demos by rearranging array items
 * - Insert intermediate demos anywhere in the progression
 * - Machine/component versions use descriptive names, not numbers
 */

/**
 * Get hen demos with calculated positions for given canvas width
 */
export function getHenDemos(
  canvasWidth: number = DEMO_CANVAS.width,
  canvasHeight: number = DEMO_CANVAS.height
): DemoConfig[] {
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
        'Stationary hen in idle state (simplest possible demo) - Visual demo + headless inspector',
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
        'Visual demo + headless inspector (for synchronized video recording)',
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
        'Back and forth movement with 1-2 second pauses - Visual demo + headless inspector',
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
    // Future demos:
    // - hen-egg-laying: Add stationary egg-laying
    // - hen-moving-eggs: Add moving egg-laying
    // - hen-full: Production version with all features
  ];
}

/**
 * Get egg demos with calculated positions for given canvas width
 */
export function getEggDemos(
  canvasWidth: number = DEMO_CANVAS.width,
  canvasHeight: number = DEMO_CANVAS.height
): DemoConfig[] {
  // Position eggs centered in the demo canvas
  // Demo canvas is 384px wide (20% of 1920px)

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
        'Egg falls straight down with gravity from top to bottom of screen - Visual demo + headless inspector',
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
        'Egg falls with gravity AND rotates continuously (like in the game) - Visual demo + headless inspector',
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
        'Egg falls and splats on the ground, showing broken egg sprite - Visual demo + headless inspector',
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
        'Incremental demo: egg falls with rotation and lands - Shows physics and landing detection - Visual demo + headless inspector',
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
        'Incremental demo: egg falls and lands, shows chick in shell - Basic hatch transition without jump - Visual demo + headless inspector',
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
        'Incremental demo: chick in shell transitions to running off - Shows exit animation without jump - Visual demo + headless inspector',
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
        'Demonstrates inserting jump: egg lands, hatches, JUMPS, then exits - Shows how jump animation fits between hatch and exit - Visual demo + headless inspector',
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
        'Full sequence matching real game: falls, hatches (300ms), jumps and bounces, pauses (500ms), runs off - Visual demo + headless inspector',
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
 * Get chef demos with custom canvas size for bottom presentation area
 */
export function getChefDemos(): DemoConfig[] {
  // Chef demos use a custom canvas size: 1920x400 at bottom of presentation area
  const chefCanvasWidth = 1920;
  const chefCanvasHeight = 400;

  // Chef starts at center X, positioned in lower portion of canvas
  const chefCenterX = Math.floor(
    chefCanvasWidth / 2 - ACTOR_SIZE.chef.width / 2
  );
  // Position chef near the bottom with 20px margin from bottom edge
  // Canvas height is 400, chef height is 344, so position at 400 - 344 - 20 = 36
  const chefY = chefCanvasHeight - ACTOR_SIZE.chef.height - 20;

  return [
    {
      id: 'Chef Idle',
      title: 'Chef - Idle',
      description:
        'Stationary chef in idle state (simplest possible demo) - Visual demo + headless inspector',
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
      title: 'Chef - Back and Forth',
      description:
        'Chef moves back and forth left to right - Visual demo + headless inspector',
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
      title: 'Chef - Facing Direction',
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
      title: 'Chef - With Pauses',
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
 * Get all demo configs for given canvas dimensions
 */
export function getDemoConfigs(
  canvasWidth: number = DEMO_CANVAS.width,
  canvasHeight: number = DEMO_CANVAS.height
): DemoConfigs {
  const henDemos = getHenDemos(canvasWidth, canvasHeight);
  const eggDemos = getEggDemos(canvasWidth, canvasHeight);
  const chefDemos = getChefDemos();

  return {
    ...Object.fromEntries(henDemos.map((d) => [d.id, d])),
    ...Object.fromEntries(eggDemos.map((d) => [d.id, d])),
    ...Object.fromEntries(chefDemos.map((d) => [d.id, d])),
  };
}

/**
 * Default demo configs (for backwards compatibility)
 */
export const demoConfigs = getDemoConfigs();
