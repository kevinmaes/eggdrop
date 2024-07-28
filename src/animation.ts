import Konva from 'konva';
import { fromPromise } from 'xstate';
import { Position } from './GameLevel/types';

export const animationActor = fromPromise(
	({
		input,
	}: {
		input: {
			ref: React.RefObject<any>;
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
			if (!input.ref.current) {
				throw new Error('No ref');
			}
			const tween = new Konva.Tween({
				node: input.ref.current,
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
			tween.play();
		});
	}
);
