import type { DemoConfigs } from './types';

/**
 * Demo Studio Configurations
 *
 * Each demo config defines:
 * - actors: Array of actor configurations (type, versions, start position)
 * - background: Background rendering settings
 * - title: Display name for the demo
 * - description: Optional longer explanation
 * - inspector: Optional Stately Inspector integration settings
 *
 * Usage:
 * - Add new demos by adding entries to this object
 * - Reference demos by their key string (e.g., 'hen-simple-walk')
 * - Versioned machines and components are loaded dynamically by ActorFactory
 *
 * Example structure:
 * ```
 * 'demo-id': {
 *   actors: [{
 *     type: 'hen',
 *     machineVersion: 'v1-simple',
 *     componentVersion: 'v1-simple',
 *     startPosition: { x: 100, y: 200 }
 *   }],
 *   background: { type: 'solid', color: '#87CEEB' },
 *   title: 'Demo Title'
 * }
 * ```
 */
export const demoConfigs: DemoConfigs = {
  // Demos will be added here in future commits
};
