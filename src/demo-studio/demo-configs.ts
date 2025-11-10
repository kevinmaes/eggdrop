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
      title: 'Hen - Idle',
      description: 'Stationary hen in idle state (simplest possible demo)',
      actors: [
        {
          type: 'hen',
          machineVersion: 'idle',
          componentVersion: 'idle',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-1',
          canvasWidth,
          canvasHeight,
        },
      ],
      background: { type: 'solid', color: '#87CEEB' },
    },
    {
      id: 'hen-back-and-forth',
      title: 'Hen - Back and Forth',
      description: 'Simple horizontal movement between left and right edges',
      actors: [
        {
          type: 'hen',
          machineVersion: 'back-and-forth',
          componentVersion: 'back-and-forth',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-1',
          canvasWidth,
          canvasHeight,
        },
      ],
      background: { type: 'solid', color: '#87CEEB' },
    },
    {
      id: 'hen-with-pauses',
      title: 'Hen - With Pauses',
      description:
        'Back and forth movement with 1-2 second pauses at each destination',
      actors: [
        {
          type: 'hen',
          machineVersion: 'with-pauses',
          componentVersion: 'with-pauses',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-1',
          canvasWidth,
          canvasHeight,
        },
      ],
      background: { type: 'solid', color: '#87CEEB' },
    },
    {
      id: 'hen-back-and-forth-headless',
      title: 'Hen - Back and Forth (Headless Inspector)',
      description:
        'Headless text-based version for inspector visualization without Konva',
      actors: [
        {
          type: 'hen',
          machineVersion: 'back-and-forth',
          componentVersion: 'back-and-forth-headless',
          startPosition: { x: henPos.centerX, y: henPos.centerY },
          id: 'hen-1',
          canvasWidth,
          canvasHeight,
        },
      ],
      background: { type: 'solid', color: '#1e1e1e' },
      inspector: {
        visible: true,
        position: 'right',
      },
    },
    // Future demos:
    // - hen-egg-laying: Add stationary egg-laying
    // - hen-moving-eggs: Add moving egg-laying
    // - hen-full: Production version with all features
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

  return {
    ...Object.fromEntries(henDemos.map((d) => [d.id, d])),
    // Future: Add chef, egg, and combined demo categories
  };
}

/**
 * Default demo configs (for backwards compatibility)
 */
export const demoConfigs = getDemoConfigs();
