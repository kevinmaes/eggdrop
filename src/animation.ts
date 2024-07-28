import Konva from 'konva';
import { fromPromise } from 'xstate';
import { Position } from './GameLevel/types';

export const animationActor = fromPromise(
	({
		input,
	}: {
		input: {
			ref: React.RefObject<Konva.Rect>;
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
			input.ref.current?.to({
				...input.animationProps,
				onFinish: () =>
					resolve({
						endPosition: {
							x: input.animationProps.x,
							y: input.animationProps.y,
						},
					}),
			});
		});
	}
);
