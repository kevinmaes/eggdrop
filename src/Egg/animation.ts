import Konva from 'konva';
import { AnyActorRef, fromPromise } from 'xstate';

type AnimationProps = {
	duration: number;
	x: number;
	y: number;
	rotation: number;
	onUpdate?: () => void;
	onFinish: () => void;
};

export const animationActor = fromPromise(
	({
		input,
	}: {
		input: {
			id: string;
			ref: React.RefObject<Konva.Rect>;
			parentRef: AnyActorRef;
			animationProps: AnimationProps;
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
