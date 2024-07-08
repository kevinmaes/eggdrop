import { setup, assign, fromPromise } from 'xstate';

export const eggMachine = setup({
	types: {} as {
		input: {
			id: number;
			position: { x: number; y: number };
			speed: number;
		};
	},
	actions: {
		updatePosition: assign({
			position: ({ context, event }) => {
				const newY =
					context.position.y + context.speed * event.output.timeDiff * 0.1;
				return {
					x: context.position.x,
					y: newY,
				};
			},
		}),
	},
	actors: {
		// Stub for a provided actor
		fallEgg: fromPromise(() => Promise.resolve({ timeDiff: 0 })),
	},
	guards: {
		hitFloor: ({ context }) => context.position.y >= window.innerHeight - 50,
		caughtByChef: ({ context, event }) => {
			return false;
			const chefX = event.chefPosition.x;
			const chefY = event.chefPosition.y;
			return (
				context.position.x >= chefX &&
				context.position.x <= chefX + 50 &&
				context.position.y >= chefY &&
				context.position.y <= chefY + 50
			);
		},
	},
}).createMachine({
	id: 'egg',
	initial: 'Falling',
	context: ({ input }) => ({
		id: input.id,
		position: input.position,
		speed: input.speed,
	}),
	states: {
		Falling: {
			invoke: {
				src: 'fallEgg',
				onDone: [
					{ target: 'Landed', guard: 'hitFloor' },
					{ target: 'Caught', guard: 'caughtByChef' },
					{ target: 'Falling', actions: 'updatePosition', reenter: true },
				],
				// actions: 'updatePosition',
			},
		},
		Landed: {
			type: 'final',
		},
		Caught: {
			type: 'final',
		},
	},
});
