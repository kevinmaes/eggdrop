import { setup, assign, fromPromise, log } from 'xstate';

export const eggMachine = setup({
	types: {} as {
		context: {
			position: { x: number; y: number };
			exitPosition: { x: number; y: number };
			fallingSpeed: number;
			exitingSpeed: number;
		};
		input: {
			id: string;
			position: { x: number; y: number };
			fallingSpeed: number;
		};
	},
	actions: {
		// Stub for a provided action
		notifyOfEggPosition: () => {},
		splatOnFloor: assign({
			position: ({ context }) => ({
				x: context.position.x - 20,
				y: window.innerHeight - 10,
			}),
		}),
		hatchOnFloor: assign({
			position: ({ context }) => ({
				x: context.position.x,
				y: window.innerHeight - 30,
			}),
		}),
		updateEggPosition: assign({
			position: ({ context, event }) => {
				const newY =
					context.position.y +
					context.fallingSpeed * event.output.timeDiff * 0.1;
				const newPosition = {
					x: context.position.x,
					y: newY,
				};

				return newPosition;
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
	},
}).createMachine({
	id: 'egg',
	initial: 'Falling',
	context: ({ input }) => ({
		id: input.id,
		position: input.position,
		fallingSpeed: input.fallingSpeed,
		exitingSpeed: 10,
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
					{
						target: 'Falling',
						actions: ['updateEggPosition', 'notifyOfEggPosition'],
						reenter: true,
					},
				],
			},
		},
		Caught: {
			entry: log('Caught!'),
			type: 'final',
		},
		Landed: {
			always: [
				{
					guard: () => Math.random() > 0.5,
					target: 'Splatting',
					actions: 'splatOnFloor',
				},
				{ target: 'Hatching', actions: 'hatchOnFloor' },
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
