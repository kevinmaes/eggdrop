import { assign, sendParent, setup } from 'xstate';

export const gameTimerMachine = setup({
	types: {} as {
		input: { remainingTime: number };
	},
}).createMachine({
	context: ({ input }) => ({
		remainingTime: input.remainingTime,
	}),
	initial: 'Ticking',
	states: {
		Ticking: {
			after: {
				1000: [
					{
						guard: ({ context }) => context.remainingTime <= 0,
						target: 'Done',
					},
					{
						target: 'Ticking',
						reenter: true,
						actions: [
							assign({
								remainingTime: ({ context }) => context.remainingTime - 1000,
							}),
							sendParent(({ context }) => ({
								type: 'Time countdown tick',
								remainingTime: context.remainingTime,
							})),
						],
					},
				],
			},
		},
		Done: {
			type: 'final',
			entry: sendParent({ type: 'Time countdown done' }),
		},
	},
});
