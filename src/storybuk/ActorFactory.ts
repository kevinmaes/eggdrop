import { createActor } from 'xstate';

import type { ActorConfig, StoryActorInstance } from './types';

/**
 * Dynamically loads a versioned state machine and component for a story actor
 *
 * Imports are resolved at runtime using Vite's dynamic import:
 * - Machine: `./stories/{storyFolder}/{type}-{machineVersion}.machine.ts`
 *   - Exception: Orchestrator stories use `story.machine.ts` or `story-headless.machine.ts`
 * - Component: `./stories/{storyFolder}/{type}-{componentVersion}.tsx`
 *
 * Story folder is determined by combining type and version:
 * - hen-idle, egg-falling, chef-back-and-forth, etc.
 *
 * Orchestrator stories (spawning-egg, chef-catch) use standardized naming:
 * - Machine file: `story.machine.ts` (or `story-headless.machine.ts`)
 * - Machine export: `storyMachine` (or `storyHeadlessMachine`)
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

  // Special folder name mappings for non-standard cases
  let storyFolder: string;
  if (type === 'egg-caught-points') {
    storyFolder = 'egg-caught-points-demo';
  } else if (machineVersion.startsWith('hatched-chick-exit')) {
    storyFolder = 'hatched-chick-exit';
  } else {
    storyFolder = `${type}-${baseMachineVersion}`;
  }

  // Orchestrator stories use story.machine.ts instead of {type}-{version}.machine.ts
  const orchestratorStories = ['spawning-egg', 'chef-catch'];
  const isOrchestrator = orchestratorStories.includes(baseMachineVersion);
  const isHeadlessVersion = machineVersion.includes('-headless');

  // Dynamically import the versioned machine
  // Vite requires the file extension in the static part of the import
  let machineModule;
  if (isOrchestrator) {
    if (isHeadlessVersion) {
      machineModule = await import(
        `./stories/${storyFolder}/story-headless.machine.ts`
      );
    } else {
      machineModule = await import(`./stories/${storyFolder}/story.machine.ts`);
    }
  } else if (machineVersion.startsWith('hatched-chick-exit')) {
    // Special case: hatched-chick-exit uses its own naming convention
    machineModule = await import(
      `./stories/${storyFolder}/${machineVersion}.machine.ts`
    );
  } else {
    machineModule = await import(
      `./stories/${storyFolder}/${type}-${machineVersion}.machine.ts`
    );
  }

  // Dynamically import the versioned component
  let componentModule;
  if (componentVersion.startsWith('hatched-chick-exit')) {
    // Special case: hatched-chick-exit uses its own naming convention
    componentModule = await import(
      `./stories/${storyFolder}/${componentVersion}.tsx`
    );
  } else {
    componentModule = await import(
      `./stories/${storyFolder}/${type}-${componentVersion}.tsx`
    );
  }

  // Build the expected named export names
  // Machine: camelCase like "henIdleMachine", "eggFallingRotatingMachine"
  // Component: PascalCase like "HenIdle", "EggFallingRotating"
  const toCamelCase = (str: string) =>
    str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  const toPascalCase = (str: string) => {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  };

  // Machine name: {type}{Version}Machine in camelCase
  // e.g., "hen" + "idle" = "henIdleMachine"
  // e.g., "hen" + "laying-falling-egg" = "henLayingFallingEggMachine"
  // Orchestrator stories export "storyMachine" or "storyHeadlessMachine"
  // Special case: hatched-chick-exit exports without 'egg' prefix
  let machineName: string;
  if (isOrchestrator) {
    machineName = isHeadlessVersion ? 'storyHeadlessMachine' : 'storyMachine';
  } else if (machineVersion.startsWith('hatched-chick-exit')) {
    machineName = isHeadlessVersion
      ? 'hatchedChickExitHeadlessMachine'
      : 'hatchedChickExitMachine';
  } else {
    machineName = `${toCamelCase(type)}${toPascalCase(machineVersion)}Machine`;
  }

  // Component name: {Type}{Version} in PascalCase
  // e.g., "hen" + "idle" = "HenIdle"
  // e.g., "hen" + "laying-falling-egg" = "HenLayingFallingEgg"
  // Special case: hatched-chick-exit exports without 'Egg' prefix
  let componentName: string;
  if (componentVersion.startsWith('hatched-chick-exit')) {
    componentName = isHeadlessVersion
      ? 'HatchedChickExitHeadless'
      : 'HatchedChickExit';
  } else {
    componentName = `${toPascalCase(type)}${toPascalCase(componentVersion)}`;
  }

  // Extract the machine and component using named exports
  const machine = machineModule[machineName];
  const Component = componentModule[componentName];

  if (!machine) {
    throw new Error(
      `Machine not found for ${type}-${machineVersion}. Expected named export "${machineName}". Available exports: ${Object.keys(machineModule).join(', ')}`
    );
  }

  if (!Component) {
    throw new Error(
      `Component not found for ${type}-${componentVersion}. Expected named export "${componentName}". Available exports: ${Object.keys(componentModule).join(', ')}`
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
