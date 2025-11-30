import Konva from 'konva';
import { fromPromise } from 'xstate';

import type { Position, RequireAtLeastOne } from './types';

// Derive EasingType from Konva.Easings
export type EasingType = keyof typeof Konva.Easings;

// Base interface for tween configuration options
export interface TweenConfigBase {
  durationMS: number;
  easing?: EasingType;
  onUpdate?: (position: Position) => void;
}

// Target properties interface (all optional in base)
interface TweenTargets {
  x?: number;
  y?: number;
  rotation?: number;
  opacity?: number;
}

// TweenConfig: base config with at least one target property required
export type TweenConfig = TweenConfigBase & RequireAtLeastOne<TweenTargets>;

/**
 * Creates and plays a Konva tween based on the provided configuration.
 * The tween is created internally from the config, encapsulating tween
 * instantiation within the actor.
 *
 * When finished, the tween is destroyed and the node's final coordinates
 * are passed to the promise's resolve function.
 */
export const tweenActor = fromPromise<
  Position,
  {
    node: Konva.Node | null;
    config: TweenConfig;
  }
>(({ input }) => {
  return new Promise((resolve, reject) => {
    if (!input.node) {
      return reject('Node does not exist');
    }

    const { durationMS, easing, onUpdate, ...targets } = input.config;

    // Convert milliseconds to seconds for Konva.Tween
    const tween = new Konva.Tween({
      node: input.node,
      duration: durationMS / 1_000,
      ...targets,
      ...(easing && { easing: Konva.Easings[easing] }),
      onUpdate: () => {
        if (onUpdate && input.node) {
          onUpdate({
            x: input.node.x(),
            y: input.node.y(),
          });
        }
      },
      onFinish: () => {
        tween.destroy();
        resolve({
          x: input.node!.x(),
          y: input.node!.y(),
        });
      },
    });

    tween.play();
  });
});
