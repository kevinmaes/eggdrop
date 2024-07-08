import { setup, assign, fromPromise } from 'xstate';

export const eggMachine = setup({
	types: {} as {
		context: {
			position: { x: number; y: number };
			exitPosition: { x: number; y: number };
			fallingSpeed: number;
			exitingSpeed: number;
		};
		input: {
			id: number;
			position: { x: number; y: number };
			fallingSpeed: number;
		};
	},
	actions: {
		updateEggPosition: assign({
			position: ({ context, event }) => {
				const newY =
					context.position.y +
					context.fallingSpeed * event.output.timeDiff * 0.1;
				return {
					x: context.position.x,
					y: newY,
				};
			},
		}),
		updateChickPosition: assign({
			position: ({ context, event }) => {
				const direction = context.exitPosition.x < 0 ? -1 : 1;
				const newX =
					context.position.x +
					direction * context.exitingSpeed * event.output.timeDiff * 0.1;
				return {
					x: newX,
					y: context.position.y,
				};
			},
		}),
	},
	actors: {
		// Stub for a provided actor
		fallEgg: fromPromise(() => Promise.resolve({ timeDiff: 0 })),
		exitChick: fromPromise(() => Promise.resolve({ timeDiff: 0 })),
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
		fallingSpeed: input.fallingSpeed,
		exitingSpeed: 5,
		exitPosition: {
			x: Math.random() > 0.5 ? window.innerWidth + 50 : -50,
			y: window.innerHeight - 50,
		},
	}),
	states: {
		Falling: {
			invoke: {
				src: 'fallEgg',
				onDone: [
					{ target: 'Landed', guard: 'hitFloor' },
					{ target: 'Caught', guard: 'caughtByChef' },
					{ target: 'Falling', actions: 'updateEggPosition', reenter: true },
				],
			},
		},
		Caught: {
			type: 'final',
		},
		Landed: {
			always: [
				{ guard: () => Math.random() > 0.5, target: 'Splatting' },
				{ target: 'Hatching' },
			],
		},
		Hatching: {
			after: {
				1000: 'Exiting',
			},
		},
		Splatting: {
			after: {
				1000: 'Done',
			},
		},
		Exiting: {
			invoke: {
				src: 'exitChick',
				onDone: [
					{
						target: 'Done',
						actions: 'updateChickPosition',
						reenter: true,
						guard: ({ context }) =>
							context.position.x === context.exitPosition.x,
					},
					{
						target: 'Exiting',
						actions: 'updateChickPosition',
						reenter: true,
					},
				],
			},
		},
		Done: {
			type: 'final',
		},
	},
});
