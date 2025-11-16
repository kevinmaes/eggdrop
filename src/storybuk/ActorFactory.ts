import { createActor } from 'xstate';

import type { ActorConfig, StoryActorInstance } from './types';

/**
 * Dynamically loads a versioned state machine and component for a story actor
 *
 * Imports are resolved at runtime using Vite's dynamic import:
 * - Machine: `./stories/{storyFolder}/{type}-{machineVersion}.machine.ts`
 * - Component: `./stories/{storyFolder}/{type}-{componentVersion}.tsx`
 *
 * Story folder is determined by combining type and version:
 * - hen-idle, egg-falling, chef-back-and-forth, etc.
 *
 * @param config - Actor configuration specifying type and versions
 * @param canvasWidth - Canvas width (from story config)
 * @param canvasHeight - Canvas height (from story config)
 * @returns Promise resolving to actor instance, component, and config
 *
 * @example
 * const instance = await createDemoActor({
 *   type: 'hen',
 *   machineVersion: 'idle',
 *   componentVersion: 'idle',
 *   startPosition: { x: 100, y: 200 }
 * }, 1920, 500);
 */
export async function createDemoActor(
  config: ActorConfig,
  canvasWidth: number,
  canvasHeight: number
): Promise<StoryActorInstance> {
  const { type, machineVersion, componentVersion, startPosition } = config;

  // Determine story folder name from type and machine version
  // Remove '-headless' suffix to get base story folder
  const baseMachineVersion = machineVersion.replace('-headless', '');
  const storyFolder =
    type === 'egg-caught-points'
      ? 'egg-caught-points-demo'
      : `${type}-${baseMachineVersion}`;

  // Dynamically import the versioned machine
  const machineModule = await import(
    `./stories/${storyFolder}/${type}-${machineVersion}.machine.ts`
  );

  // Dynamically import the versioned component
  const componentModule = await import(
    `./stories/${storyFolder}/${type}-${componentVersion}.tsx`
  );

  // Extract the machine and component
  const machine = machineModule.default || machineModule[`${type}Machine`];
  const Component =
    componentModule.default || componentModule[`${type}Component`];

  if (!machine) {
    throw new Error(
      `Machine not found for ${type}-${machineVersion}. Ensure the module exports a default or named export.`
    );
  }

  if (!Component) {
    throw new Error(
      `Component not found for ${type}-${componentVersion}. Ensure the module exports a default or named export.`
    );
  }

  // Check if this is a headless component (creates its own actor)
  const isHeadless = componentVersion.includes('headless');

  // Headless components create their own actors with inspector integration
  // So we create a dummy actor that won't be used
  let actor;
  if (isHeadless) {
    // Create a minimal dummy actor just to satisfy the type
    actor = null as any;
  } else {
    // Create the actor with the start position and canvas dimensions
    // NOTE: Actor is NOT started - Storybuk will start it via Play button
    // We explicitly prevent auto-start by not calling .start() here

    // Special handling for egg-caught-points which has different input requirements
    let input: any;
    if (type === 'egg-caught-points') {
      input = {
        eggCaughtPointsId: config.id || `${type}-${Date.now()}`,
        eggColor: (config as any).eggColor || 'white',
        position: startPosition,
      };
    } else {
      input = {
        startPosition,
        id: config.id || `${type}-${Date.now()}`,
        canvasWidth,
        canvasHeight,
      };
    }

    actor = createActor(machine, { input });
    // Actor is in 'stopped' state until Storybuk calls actor.start()
  }

  return {
    actor,
    Component,
    config,
  };
}
