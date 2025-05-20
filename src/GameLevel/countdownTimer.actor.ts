import { fromCallback, type ActorRef, type Snapshot } from 'xstate';

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
  {
    parent: ActorRef<Snapshot<unknown>, CountdownTimerTickEvent>;
    totalMS: number;
    tickMS: number;
  }
>(({ input, receive }) => {
  const { parent, totalMS, tickMS } = input;

  let remainingMS = totalMS;
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
      return parent.send({ type: 'Tick', remainingMS: 0, done: true });
    }

    if (isActive) {
      parent.send({ type: 'Tick', remainingMS, done: false });

      setTimeout(() => {
        remainingMS -= tickMS;
        countdown();
      }, tickMS);
    }
  }

  countdown();
});
