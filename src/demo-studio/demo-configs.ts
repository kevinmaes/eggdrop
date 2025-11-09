import { HEN_DEMO } from './demo-constants';
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
 * Hen Demos
 *
 * Progressive demonstrations of hen behavior, from simple to complex.
 * Order in this array determines the presentation sequence.
 */
export const henDemos: DemoConfig[] = [
  {
    id: 'hen-idle',
    title: 'Hen - Idle',
    description: 'Stationary hen in idle state (simplest possible demo)',
    actors: [
      {
        type: 'hen',
        machineVersion: 'idle',
        componentVersion: 'idle',
        startPosition: { x: HEN_DEMO.centerX, y: HEN_DEMO.centerY },
        id: 'hen-1',
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
        startPosition: { x: HEN_DEMO.centerX, y: HEN_DEMO.centerY },
        id: 'hen-1',
      },
    ],
    background: { type: 'solid', color: '#87CEEB' },
  },
  // Future demos:
  // - hen-with-pauses: Add stopping/pausing at each edge
  // - hen-egg-laying: Add stationary egg-laying
  // - hen-moving-eggs: Add moving egg-laying
  // - hen-full: Production version with all features
];

/**
 * All demos flattened into a single record for lookup
 */
export const demoConfigs: DemoConfigs = {
  ...Object.fromEntries(henDemos.map((d) => [d.id, d])),
  // Future: Add chef, egg, and combined demo categories
};
