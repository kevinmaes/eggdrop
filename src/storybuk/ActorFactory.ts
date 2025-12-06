import { createActor } from 'xstate';

import type { ActorConfig, StoryActorInstance } from './types';

/**
 * Creates a story actor instance from explicit machine and component references
 *
 * This factory uses explicit imports provided in the story config,
 * eliminating all pattern matching and dynamic import logic.
 *
 * @param config - Actor configuration with explicit machine and Component references
 * @param canvasWidth - Canvas width (from story config)
 * @param canvasHeight - Canvas height (from story config)
 * @returns Promise resolving to actor instance, component, and config
 *
 * @example
 * const instance = await createDemoActor({
 *   type: 'hen',
 *   machineVersion: 'idle',
 *   componentVersion: 'idle',
 *   startPosition: { x: 100, y: 200 },
 *   machine: henIdleMachine,
 *   Component: HenIdle,
 * }, 1920, 500);
 */
export async function createDemoActor(
  config: ActorConfig,
  canvasWidth: number,
  canvasHeight: number
): Promise<StoryActorInstance> {
  const { type, componentVersion, startPosition } = config;

  // All stories must now provide explicit machine and component references
  if (!config.machine || !config.Component) {
    throw new Error(
      `Story config must provide explicit machine and Component references. Missing for ${type}-${config.machineVersion}`
    );
  }

  const machine = config.machine;
  const Component = config.Component;
  const isHeadless = componentVersion.includes('headless');

  let actor;
  if (isHeadless) {
    // Headless components create their own actors with inspector integration
    actor = null as any;
  } else {
    // Create the actor with the start position and canvas dimensions
    // NOTE: Actor is NOT started - Storybuk will start it via Play button
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
