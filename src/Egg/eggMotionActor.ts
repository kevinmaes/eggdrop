import { type AnyActorRef, fromPromise } from 'xstate';
import Konva from 'konva';
import type { Direction, Position } from '../types';

export const eggMotionActor = fromPromise<
  Position,
  {
    node: React.RefObject<any>['current'];
    initialPosition: Position;
    xSpeed: number;
    ySpeed: number;
    testForDestination: (yPos: number) => boolean;
    rotationDirection: Direction['value'];
    parent: AnyActorRef;
  }
>(({ input }) => {
  return new Promise((resolve, reject) => {
    if (!input.node) {
      throw new Error('No eggRef');
    }
    const animation = new Konva.Animation(frame => {
      if (!input.node) {
        animation.stop();
        return reject('No eggRef');
      } else if (input.testForDestination(input.node.y())) {
        animation.stop();
        resolve({
          x: input.node.x(),
          y: input.node.y(),
        });
      }

      if (frame) {
        // Calculate new x and y positions
        const newXPos = input.node.x() + input.xSpeed;
        input.node.x(newXPos);

        // Calculate new y position with a minimum change threshold
        const minYChange = 2.5; // Minimum change in Y position to prevent it from stalling
        const deltaY = input.ySpeed * (frame.timeDiff / 1000);

        // Ensure there's always a minimum change in the Y position
        const newYPos =
          input.node.y() +
          (Math.abs(deltaY) > minYChange ? deltaY : minYChange * Math.sign(input.ySpeed));
        input.node.y(newYPos);

        // Rotate the egg
        const currentRotation = input.node.rotation();
        const newRotation = currentRotation + input.rotationDirection * 5;
        input.node.rotation(newRotation);

        // Send a message to the parent to update the egg position
        // Make sure the egg actor ref is still active
        if (input.parent.getSnapshot().status === 'active') {
          input.parent.send({
            type: 'Notify of animation position',
            position: { x: newXPos, y: newYPos },
          });
        }
      }
    });
    animation.start();
  });
});
