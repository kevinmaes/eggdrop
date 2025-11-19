import Konva from 'konva';
import { assign, setup } from 'xstate';

import { HEN_DEMO } from '../../story-constants';

import type { Position } from '../../../types';

/**
 * Hen Egg Laying Machine
 *
 * Demonstrates a hen that cycles between idle and egg-laying states.
 * The hen stays stationary (no X-axis movement) and shows different
 * sprite frames based on state.
 *
 * Features:
 * - Idle state (forward-facing sprite)
 * - Egg-laying state (back-facing sprite showing backside of hen)
 * - Automatic cycling between states
 *
 * Demonstrates:
 * - State transitions with timing
 * - Tag-based state tracking for visual representation
 * - henRef management for Konva integration
 */

const DEMO_CONFIG = {
  henWidth: 120,
  henHeight: 120,
  defaultX: HEN_DEMO.centerX,
  defaultY: HEN_DEMO.centerY,
};

const henEggLayingMachine = setup({
  types: {} as {
    input: {
      id: string;
      startPosition: Position;
    };
    output: {
      henId: string;
    };
    context: {
      henRef: React.RefObject<Konva.Image> | { current: null };
      id: string;
      position: Position;
    };
    events: { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> };
  },
  actions: {
    setHenRef: assign({
      henRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAkwDswBcBOYB0AZgBYCWAdmAHQAy+hUAxBMbgNoAMAuoqAA6qwBLWMVx8QAD0QBGAOwA2AJwAaEAE9EAZgCsARgAsS-UoCcugarUBOXQF8LutJhwEAcvXoByMWoBusjACiNPSMIADaAK5gAPZ0AApRDFws7Jy8AsJIIBJSsvJKyirqCKr61taGqo7qJqaW1iC2Dk6u7p4wPn4gocwRkdFxsQCSdDSsIIkp6XwCQiISyFWV1nq4JqYQqo66utaq6j1mjf0gAUHhvlExdBD+y3TL0etbO3v76hJSUjcymiqIBpqKxWXT6axGTRWU7mC5XG4AYU8ADkwABRMjkajMX6bfYFBxFIqlU4QMwQCp1GqI3oo-oQRqNOxWKzqJGXQzAiZTGZzBZLb5JX6pTIFYqU6q09QILQyuoWay6LSVRqy3QgozDZbM55vD5fX6LJKi8WS9T0xmM5lspnQVn-Tn7bkHI7WIoQ3C3KVWQwI7R6LQjdraUwVczWNGXOY3WBBLxuMBgWAAJQAolguHQ8OwAGIACQAqmB6ABVOMAQSwLEo4BIEm57FtHA53N5UBdxde7IVBXOBWlJWqNWstQ0Vhq1lFhguP3+AOBoduiKb1ghuC0BqM+s0VhFPcRSNRkdQXF7Ff7g6Hw5HICjU5nc4XEjXsqO8pKe4UqLUur3tEDQ0dR8X0YFy3mEF-yqAhDTudQYLafQ62qFF1DqGDVBqCDYOg2EEQAMSgAAJSgAElGKRQgeIhUU8xI5J5GvCQUTRKitR0N5WjhACewqdRVC0epugaEC3y4Mc-mBUFwXedcACVKIAWQANTMqBTN8xQ0XOIiSjBSjJLEqT7JucTMGkuiGNqQwiOI-QbE6fRujNEwenRAB5MBcVozYpAhKipOqO5JJI3KbPRR96iVMphiw78TF0pTsJbNEAHk8VAJLKGrGzIvq5rTLatrnNk4r5K0lzNAhOwegANQAeRADVxuGjYWDYPYWBwRgVKkjSjImkyhqGuSFPijQlUheoek6Lp1HaGDHNw5rWumjCcNm+bFoY5b6NWqjNoU3jRN6TTur1HRyU4qxlXfSwHB6aEvOczQNqwra9sm6bpJWuT+OBBBQRMxbTo2gBHRgEAYBQVGYd7YHMjdaL6ez8d005Kl0Ho-Ls+wrCqT8+mh-omlwgAFMBGHx-rMew5h2FYCR6fMXzyVB96QqOCB9C1CFjJqfU+kUv6vJ6VpZqVJaVrVjbccxniCZI8UGLOg7xOqo3LTrX19TMW1PqB3r-oqawBihZzjz4xBlx8PQGf1JpTHwwHWiUh2sSQfAUXdt3mAYAAhZhACEAA0S7Lb3ptd0iw8kwOg6h-qet0a1egDRD+I-c9p2zF7q7Y9P4XOjG9H+T0xPk7N1OTW0A1VCqWFx1-VFbHzzrucBnAB5geIX+XPCNzqHCKO8QCMnV7k9D9Pw7A35w9-cPVWh9njDhIZ7dxKtOrhzfMCq+KMXp73r43vhiC0b4gNsm6z8cSawiwhYP2tjLY2QdTawzKr-Qqek+hq36r1IY-RBLWAqpZayV8qo3zvpHEiMtKKh2gJHWglEy4B17uXcQEJq7ZwokPViwtOhP0xnVKw0E+rVxMAPC4Jp-L4WqoHIOzt6AqxdhoN2HsrYe27BzUBYC1IrRBnkMGI0bQ1FUMTeuKDjQgPZBaaC0D6gw0FDYsqCIYGolbqw9uaJO7dylj3OWA8h4fhHolCeCUdhGUVNYQs78o6mXwJLa+ctPZUP9pQ3BGk4EmzJBAX2Jsw5dF-h-HCPQPKgL6DYpUbQb62QSL3XufcBGtzYbwzh2spCqx0WbPRwCjFgJArrWwQJ9RWBwrjH+0NwH+nqtHe0n0g5I2hq7WGzsj5yzdg46gCsiJ+J9gEsegTpakLCREjeUTt7BPqrMMaSp9QVDFJDToh8Bi4Uql0lpbTQ77Ujpw3psz9HzPWXjEmZMoaU2pqZTRdMIDCn+iM+IK8gS4P-vs6w+FVQ4IJnZJUJVOggXQXBGJ98Tb313vvWx6z0rP1vgjCZEL0oWAsBYKGo1v66nmX0sO+1Oig3qOlBU0DOrOWst5JZBCVloI2ds3Z+yKYd2OQrM51hNBayuZDf+P8KqWCwoXVZDk1p2S2m43a+KKW0qwfSlhnCuFxM5QKipQqI7SWGE-H66oQFoPhXNX+D0gbVQgbUzBurkUMrZVkjlvK+UhwFT3cJBSxV5QNOUd+z93KVVURokRMNTR1D-KVAVrT16cP1fwoVLsEqrJVYkxmLhFBFOUdNOGMDrX2SBtqPy+yHRnw9iCa+LNjlOp+fUv51rJJSJIbcp+sNVQ2m1SfUpLqvXgumvjT0sJjWQrQGwF43BQCyBwMAWA-8gA */
  id: 'Hen-Egg-Laying',
  context: ({ input }) => ({
    henRef: { current: null },
    id: input.id,
    position: input.startPosition || {
      x: DEMO_CONFIG.defaultX,
      y: DEMO_CONFIG.defaultY,
    },
  }),
  output: ({ context }) => ({
    henId: context.id,
  }),
  on: {
    'Set henRef': {
      actions: {
        type: 'setHenRef',
        params: ({ event }) => event.henRef,
      },
    },
  },
  initial: 'Idle',
  states: {
    Idle: {
      after: {
        1500: 'Preparing to lay',
      },
    },
    'Preparing to lay': {
      after: {
        200: 'Laying egg',
      },
    },
    'Laying egg': {
      tags: 'laying',
      after: {
        2000: 'Done laying',
      },
    },
    'Done laying': {
      after: {
        200: 'Idle',
      },
    },
  },
});

export default henEggLayingMachine;
