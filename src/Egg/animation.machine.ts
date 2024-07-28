import Konva from 'konva';
import { AnyActorRef, setup } from 'xstate';

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
