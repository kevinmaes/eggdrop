import Konva from 'konva';
import { fromPromise } from 'xstate';
import { Position } from './GameLevel/types';

export const animationActor = fromPromise(
	({
		input,
	}: {
		input: {
			node: React.RefObject<any>['current'] | null;
			setTween?: (t: Konva.Tween) => void;
			animationProps: {
				duration: number;
				x: number;
				y: number;
				rotation?: number;
				easing?: (typeof Konva.Easings)[keyof typeof Konva.Easings];
				onUpdate?: () => void;
			};
		};
	}) => {
		return new Promise<{ endPosition: Position }>((resolve) => {
			if (!input.node) {
				throw new Error('No ref');
			}
			const tween = new Konva.Tween({
				node: input.node,
				...input.animationProps,
				onFinish: () => {
					tween.destroy();
					return resolve({
						endPosition: {
							x: input.animationProps.x,
							y: input.animationProps.y,
						},
					});
				},
			});
			// Pass the tween back to the caller so it can be paused and played
			input.setTween?.(tween);
			tween.play();
		});
	}
);
