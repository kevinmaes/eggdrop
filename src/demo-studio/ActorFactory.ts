import { createActor } from 'xstate';

import type { ActorConfig, DemoActorInstance } from './types';

/**
 * Dynamically loads a versioned state machine and component for a demo actor
 *
 * Imports are resolved at runtime using Vite's dynamic import:
 * - Machine: `./machines/{type}/{type}-{machineVersion}.machine.ts`
 * - Component: `./components/{type}/{type}-{componentVersion}.tsx`
 *
 * @param config - Actor configuration specifying type and versions
 * @returns Promise resolving to actor instance, component, and config
 *
 * @example
 * const instance = await createDemoActor({
 *   type: 'hen',
 *   machineVersion: 'v1-simple',
 *   componentVersion: 'v1-simple',
 *   startPosition: { x: 100, y: 200 }
 * });
 */
export async function createDemoActor(
  config: ActorConfig
): Promise<DemoActorInstance> {
  const { type, machineVersion, componentVersion, startPosition } = config;

  // Dynamically import the versioned machine
  const machineModule = await import(
    `./machines/${type}/${type}-${machineVersion}.machine.ts`
  );

  // Dynamically import the versioned component
  const componentModule = await import(
    `./components/${type}/${type}-${componentVersion}.tsx`
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

  // Create the actor with the start position
  const actor = createActor(machine, {
    input: {
      startPosition,
      id: config.id || `${type}-${Date.now()}`,
    },
  });

  actor.start();

  return {
    actor,
    Component,
    config,
  };
}
