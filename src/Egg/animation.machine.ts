import Konva from 'konva';
import { AnyActorRef, fromPromise, setup } from 'xstate';

type AnimationProps = {
	duration: number;
	x: number;
	y: number;
	rotation: number;
	onUpdate?: () => void;
	onFinish: () => void;
};

export const animationMachine = setup({
	types: {} as {
		context: {
			id: string;
			ref: React.RefObject<Konva.Rect>;
			parentRef: AnyActorRef;
			animationProps: AnimationProps;
		};
		input: {
			id: string;
			ref: React.RefObject<Konva.Rect>;
			parentRef: AnyActorRef;
			animationProps: AnimationProps;
		};
	},
}).createMachine({
	id: 'animation',
	initial: 'running',
	context: ({ input }) => ({
		id: input.id,
		ref: input.ref,
		parentRef: input.parentRef,
		animationProps: input.animationProps,
	}),
	entry: ({ context }) => {
		context.ref.current?.to({
			...context.animationProps,
		});
	},
	states: {
		running: {},
	},
});

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
			console.log('Running animation promise');
			input.ref.current?.to({
				...input.animationProps,
				onFinish: () => {
					resolve();
				},
			});
		});
	}
);
