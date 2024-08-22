import { AnyActorRef, fromPromise } from 'xstate';
import { Position } from '../GameLevel/types';
import Konva from 'konva';

export const eggMotionActor = fromPromise<
	Position,
	{
		node: React.RefObject<any>['current'];
		maxYPos: number;
		initialPosition: Position;
		xSpeed: number;
		ySpeed: number;
		rotationDirection: -1 | 0 | 1;
		parentRef: AnyActorRef;
	}
>(({ input }) => {
	return new Promise((resolve, reject) => {
		if (!input.node) {
			throw new Error('No eggRef');
		}
		const animation = new Konva.Animation((frame) => {
			if (!input.node) {
				animation.stop();
				return reject('No eggRef');
			} else if (input.node.y() >= input.maxYPos) {
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
				const newYPos = input.initialPosition.y + frame.time * input.ySpeed;
				input.node.y(newYPos);

				// Rotate the egg
				const currentRotation = input.node.rotation();
				const newRotation = currentRotation + input.rotationDirection * 5;
				input.node.rotation(newRotation);

				// Send a message to the parent to update the egg position
				// Make sure the egg actor ref is still active
				if (input.parentRef.getSnapshot().status === 'active') {
					input.parentRef.send({
						type: 'Notify of animation position',
						position: { x: newXPos, y: newYPos },
					});
				}
			}
		});
		animation.start();
	});
});
