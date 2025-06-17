import Konva from 'konva';
import { fromPromise } from 'xstate';

import type { Direction, Position } from '../types';

/**
 * This actor is responsible for moving the egg down the screen.
 */
export const eggMotionActor = fromPromise<
  Position,
  {
    node: React.RefObject<any>['current'];
    initialPosition: Position;
    xSpeed: number;
    ySpeed: number;
    rotationDirection: Direction['value'];
    testForDestination: (yPos: number) => boolean;
    notifyParentOfPosition: (position: Position) => void;
  }
>(({ input }) => {
  return new Promise((resolve, reject) => {
    if (!input.node) {
      return reject('No eggRef');
    }

    // Create new Animation instance
    const animation = new Konva.Animation((frame) => {
      if (!input.node) {
        animation.stop();
        return reject('No eggRef');
      }

      // Check if the egg has reached the destination
      const eggReachedDestination = input.testForDestination(input.node.y());
      if (eggReachedDestination) {
        animation.stop();
        resolve({
          x: input.node.x(),
          y: input.node.y(),
        });
      }

      if (frame) {
        // Calculate and set a new X position
        const newXPos = input.node.x() + input.xSpeed;
        input.node.x(newXPos);

        // Calculate new y position with a minimum change threshold
        const minYChange = 2.5; // Minimum change in Y position to prevent it from stalling
        const deltaY = input.ySpeed * (frame.timeDiff / 1000);

        // Ensure there's always a minimum change in the Y position
        const newYPos =
          input.node.y() +
          (Math.abs(deltaY) > minYChange
            ? deltaY
            : minYChange * Math.sign(input.ySpeed));
        // Set the new Y position
        input.node.y(newYPos);

        // Rotate the egg a bit more in whatever direction it's already rotating
        const currentRotation = input.node.rotation();
        const newRotation = currentRotation + input.rotationDirection * 5;
        input.node.rotation(newRotation);

        // Send a message to the parent to update it of the lastest position
        input.notifyParentOfPosition({ x: newXPos, y: newYPos });
      }
    });

    // Start the animation immediately
    animation.start();
  });
});
