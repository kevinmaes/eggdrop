import { fromCallback } from 'xstate';

export type CountdownTimerTickEvent = {
	type: 'Tick';
	remainingMS: number;
	done: boolean;
};
/**
 * Creates a reusable countdown timer actor that
 * sends a 'Tick' event every `tickMS` milliseconds.
 * A `done` flag is set to `true` when the countdown is complete.
 *
 * The actor can be paused and resumed by sending a 'Pause' or 'Resume' event.
 */
export const countdownTimer = fromCallback<
	{ type: 'Pause' | 'Resume' },
	{ totalMS: number; tickMS: number }
>(({ input, sendBack: _sendBack, receive }) => {
	const sendBack: (event: CountdownTimerTickEvent) => void = _sendBack;

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
