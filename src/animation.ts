import Konva from 'konva';
import { fromPromise } from 'xstate';
import { Position } from './GameLevel/types';

export const animationActor = fromPromise<
	{ endPosition: Position },
	{
		node: React.RefObject<any>['current'] | null;
		tween: Konva.Tween | null;
	}
>(({ input }) => {
	return new Promise((resolve, reject) => {
		if (input.node !== null && input.tween !== null) {
			input.tween.play();
			input.tween.onFinish = () => {
				input.tween?.destroy();
				resolve({
					endPosition: {
						x: input.node.x(),
						y: input.node.y(),
					},
				});
			};
		} else {
			return reject('No node or tween');
		}
	});
});
