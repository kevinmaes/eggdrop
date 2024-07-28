import Konva from 'konva';
import { fromPromise } from 'xstate';

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
				rotation: number;
				onUpdate?: () => void;
			};
		};
	}) => {
		return new Promise<void>((resolve) => {
			input.ref.current?.to({
				...input.animationProps,
				onFinish: resolve,
			});
		});
	}
);
