import { assign, setup } from 'xstate';

export const countdownTimerMachine = setup({
	types: {} as {
		input: {
			totalMS: number;
			tickMS: number;
		};
		context: {
			tickMS: number;
			remainingMS: number;
			done: boolean;
		};
	},
	delays: {
		tick: ({ context }) => context.tickMS,
	},
	guards: {
		hasTimeRemaining: ({ context }) => context.remainingMS > 0,
	},
	actions: {
		tickDown: assign({
			remainingMS: ({ context }) => context.remainingMS - context.tickMS,
		}),
	},
}).createMachine({
	/** @xstate-layout N4IgpgJg5mDOIC5QGED2BXAdgFwqg7pgAQAqAlgLZgBOAxHpmAHSzYCG2zaWuBx5VagG0ADAF1EoAA6pYZbGVSZJIAB6IAbABYAHExEBGAMwGAnCIDsAVlMAmUxqsAaEAE9EFkU1tWjVnwYWtiLBFloAvuEu3Dh4hKSUNEzkAMYA1mSYULSqrBzMbABmnNQAFArpAJS0MbzxAkmpGVmiEkggMnIKSirqCAY6XloWGiJ2IkbBOqYWOi7uCLa2TBqmMzNLVp5mFpHRGLF8CYLJZOmZ2bnsnExFJeVnadW1cfyJ1KfnLQZt0rLyimU7T6wS0TC0ph0RhCpisOh0WkstnmiB0ViY01Gk1siOGiNMkSiIEwqAgcBULyODWoKk6AJ6wMQBg03jGpiMazs0NWFhRCAAtAYDGDfKD2SYTLZJnsQJT6u9Ps0oLT-t0gaA+tpWWsOWspSIeXzbAYmAZjYFAqMRFYtkYZXK3icACJKMAqrqA3qILQaE32XE2IzTZkGPlmDFhM1jRwQtZmwnhIA */
	id: 'Countdown Timer',
	context: ({ input }) => ({
		tickMS: input.tickMS,
		remainingMS: input.totalMS,
		done: false,
	}),
	initial: 'Ticking',
	states: {
		Ticking: {
			after: {
				tick: [
					{
						guard: 'hasTimeRemaining',
						target: 'Ticking',
						actions: 'tickDown',
						reenter: true,
					},
					{ target: 'Done', actions: assign({ done: true }) },
				],
			},
		},
		Done: {
			type: 'final',
		},
	},
});
