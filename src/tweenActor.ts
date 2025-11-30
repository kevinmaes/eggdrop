import Konva from 'konva';
import { fromPromise } from 'xstate';

import type { Position } from './types';

// Derive EasingType from Konva.Easings
export type EasingType = keyof typeof Konva.Easings;

// Require at least one target property to ensure the tween animates something
type TweenTargets =
  | { x: number; y?: number; rotation?: number; opacity?: number }
  | { y: number; x?: number; rotation?: number; opacity?: number }
  | { rotation: number; x?: number; y?: number; opacity?: number }
  | { opacity: number; x?: number; y?: number; rotation?: number };

// Use type intersection instead of interface extension for union types
export type TweenConfig = TweenTargets & {
  durationMS: number;
  easing?: EasingType;
  onUpdate?: (position: Position) => void;
};

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
