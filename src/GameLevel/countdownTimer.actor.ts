import { fromCallback, fromTransition } from 'xstate';

/**
 * Creates a reusable countdown timer actor that
 * sends a 'Tick' event every `tickMS` milliseconds.
 * A `done` flag is set to `true` when the countdown is complete.
 *
 * The actor can be paused and resumed by sending a 'Pause' or 'Resume' event.
 */
export const countdownTimerx = fromCallback<
	{ type: 'Pause' | 'Resume' },
	{ totalMS: number; tickMS: number }
>(({ input, sendBack, receive }) => {
	let remainingMS = input.totalMS;
	let isActive = true;

	receive(({ type }) => {
		if (type === 'Pause') {
			isActive = false;
		}
		if (type === 'Resume') {
			isActive = true;
			countdown();
		}
	});

	function countdown() {
		if (remainingMS <= 0) {
			return sendBack({ type: 'Tick', remainingMS: 0, done: true });
		}

		if (isActive) {
			sendBack({ type: 'Tick', remainingMS, done: false });

			setTimeout(() => {
				remainingMS -= input.tickMS;
				countdown();
			}, input.tickMS);
		}
	}

	countdown();
});

export const countdownTimer = fromTransition(
	({ remainingMS }, event) => {
		console.log('event', event);
		return {
			remainingMS: remainingMS - 1000,
		};
	},
	({ input, self }) => {
		setTimeout(() => {
			self.send({ type: 'Tick' });

			return {
				remainingMS: 60000,
			};
		}, 1000);
	}
);
