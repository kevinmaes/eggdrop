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
      id: 'hen-idle',
      title: 'Hen - Idle (Dual Mode)',
      description:
        'Stationary hen in idle state (simplest possible demo) - Visual demo + headless inspector',
      actors: [
        {
          type: 'hen',
          machineVersion: 'idle',
          componentVersion: 'idle',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-visual',
          canvasWidth,
          canvasHeight,
        },
        {
          type: 'hen',
          machineVersion: 'idle-headless',
          componentVersion: 'idle-headless',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-headless',
          canvasWidth,
          canvasHeight,
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'vertical-split-top',
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'hen-back-and-forth',
      title: 'Hen - Back and Forth (Dual Mode)',
      description:
        'Visual demo + headless inspector (for synchronized video recording)',
      actors: [
        {
          type: 'hen',
          machineVersion: 'back-and-forth',
          componentVersion: 'back-and-forth',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-visual',
          canvasWidth,
          canvasHeight,
        },
        {
          type: 'hen',
          machineVersion: 'back-and-forth-headless',
          componentVersion: 'back-and-forth-headless',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-headless',
          canvasWidth,
          canvasHeight,
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'vertical-split-top',
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'hen-with-pauses',
      title: 'Hen - With Pauses (Dual Mode)',
      description:
        'Back and forth movement with 1-2 second pauses - Visual demo + headless inspector',
      actors: [
        {
          type: 'hen',
          machineVersion: 'with-pauses',
          componentVersion: 'with-pauses',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-visual',
          canvasWidth,
          canvasHeight,
        },
        {
          type: 'hen',
          machineVersion: 'with-pauses-headless',
          componentVersion: 'with-pauses-headless',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-headless',
          canvasWidth,
          canvasHeight,
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
  // Center the egg: (canvasWidth / 2) - (egg width / 2)
  const eggCenterX = Math.floor((canvasWidth - ACTOR_SIZE.egg.width) / 2);
  const startY = 100; // Starting Y position (roughly where hen would be)

  return [
    {
      id: 'egg-falling',
      title: 'Egg - Falling',
      description:
        'Egg falls straight down with gravity from top to bottom of screen - positioned in left 20% of canvas',
      actors: [
        {
          type: 'egg',
          machineVersion: 'falling',
          componentVersion: 'falling',
          startPosition: { x: eggCenterX, y: startY },
          id: 'egg-falling',
          canvasWidth,
          canvasHeight,
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'horizontal-split-narrow',
      inspector: { visible: true, position: 'right' },
    },
    {
      id: 'egg-splat',
      title: 'Egg - Splat',
      description:
        'Egg falls and splats on the ground, showing broken egg sprite - simplified version of full egg machine',
      actors: [
        {
          type: 'egg',
          machineVersion: 'splat',
          componentVersion: 'splat',
          startPosition: { x: eggCenterX, y: startY },
          id: 'egg-splat',
          canvasWidth,
          canvasHeight,
        },
      ],
      background: { type: 'solid', color: '#2c5f7f' },
      layoutMode: 'horizontal-split-narrow',
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

  return {
    ...Object.fromEntries(henDemos.map((d) => [d.id, d])),
    ...Object.fromEntries(eggDemos.map((d) => [d.id, d])),
    // Future: Add chef and combined demo categories
  };
}

/**
 * Default demo configs (for backwards compatibility)
 */
export const demoConfigs = getDemoConfigs();
