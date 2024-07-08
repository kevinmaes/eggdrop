import { assign, fromPromise, setup } from 'xstate';

export const chefMachine = setup({
	types: {} as {
		context: {
			position: { x: number; y: number };
			speed: number;
			speedLimit: number;
			direction: -1 | 0 | 1;
			acceleration: number;
			deceleration: number;
		};
		events:
			| { type: 'Catch' }
			| { type: 'Set direction'; direction: -1 | 0 | 1 };
		input: {
			position: { x: number; y: number };
			speed: number;
			speedLimit: number;
			acceleration: number;
			deceleration: number;
		};
	},
	actions: {
		// Stub for a provided action
		updateChefPosition: () => {},
	},
	actors: {
		// Stub for a provided actor
		moveChef: fromPromise(() => Promise.resolve({ timeDiff: 0 })),
	},
}).createMachine({
	id: 'chef',
	initial: 'Moving',
	context: ({ input }) => ({
		position: input.position,
		speed: input.speed,
		speedLimit: input.speedLimit,
		direction: 0,
		acceleration: input.acceleration,
		deceleration: input.deceleration,
	}),
	on: {
		'Set direction': {
			actions: assign({
				direction: ({ event }) => ('direction' in event ? event.direction : 0),
			}),
		},
	},
	states: {
		Moving: {
			invoke: {
				src: 'moveChef',
				onDone: {
					target: 'Moving',
					reenter: true,
					actions: ['updateChefPosition'],
				},
			},
			on: {
				Catch: {
					target: 'Catching',
					actions: assign({
						direction: 0,
						speed: 0,
					}),
				},
			},
		},
		Catching: {
			after: {
				200: 'Moving',
			},
		},
	},
});
