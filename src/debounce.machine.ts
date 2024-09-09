import { setup } from 'xstate';

export const debouncingMachine = setup({
	types: {
		events: {} as { type: 'go' },
		context: {} as {},
	},
	actions: {},
}).createMachine({
	id: 'Debouncing',
	context: {},
	initial: 'Idle',
	states: {
		Idle: {
			on: {
				go: {
					target: 'Debouncing',
				},
			},
		},
		Debouncing: {
			after: {
				'1000': {
					target: 'Idle',
					// actions: 'Increment counter',
				},
			},
			on: {
				go: {
					target: 'Debouncing',
					description:
						'Re-enter `Debouncing` state and reinitialize the delayed transition.',
					reenter: true,
				},
			},
		},
	},
});
