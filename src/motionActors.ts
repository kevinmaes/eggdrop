import Konva from 'konva';
import { fromPromise } from 'xstate';
import type { Position } from './types';

/**
 * Takes any node and its pre-existing tween and plays the tween
 * Any tween callbacks may have already been attached to the tween
 * outside of this actor
 */
export const tweenActor = fromPromise<
	Position,
	{
		node: React.RefObject<any>['current'] | null;
		tween: Konva.Tween | null;
	}
>(({ input }) => {
	return new Promise((resolve, reject) => {
		if (!input.node || !input.tween) {
			return reject('Node or tween does not exist');
		}
		input.tween.play();
		input.tween.onFinish = () => {
			input.tween?.destroy();
			resolve({
				x: input.node.x(),
				y: input.node.y(),
			});
		};
	});
});
