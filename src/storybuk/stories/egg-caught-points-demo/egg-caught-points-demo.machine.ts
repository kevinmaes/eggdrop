/**
 * Egg Caught Points Story Machine
 *
 * Re-exports the main eggCaughtPointsMachine for use in storybuk.
 */

import { eggCaughtPointsMachine } from '../../../EggCaughtPoints/eggCaughtPoints.machine';

// Re-export with the naming convention expected by ActorFactory
// type: 'egg-caught-points', machineVersion: 'demo' -> 'eggCaughtPointsDemoMachine'
export { eggCaughtPointsMachine as eggCaughtPointsDemoMachine };
