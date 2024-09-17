import { setup } from 'xstate';

export const soundMachine = setup({
	types: {} as {
		events: { type: 'play' };
		context: {
			debouncedSounds: Set<string>;
		};
	},
	actions: {},
}).createMachine({
	id: 'Sound',
	context: {
		debouncedSounds: new Set<string>(),
	},
	initial: 'Idle',
	states: {
		Idle: {
			on: {
				play: [{ guard: () => true }, {}],
			},
		},
		Debouncing: {
			after: {
				'1000': {
					target: 'Idle',
				},
			},
			on: {
				play: {
					target: 'Debouncing',
					description:
						'Re-enter `Debouncing` state and reinitialize the delayed transition.',
					reenter: true,
				},
			},
		},
	},
});
