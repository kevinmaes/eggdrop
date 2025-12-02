import Konva from 'konva';
import { assign, setup } from 'xstate';

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

export const henEggLayingMachine = setup({
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
    events:
      | { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> }
      | { type: 'Play' };
  },
  actions: {
    setHenRef: assign({
      henRef: (_, params: React.RefObject<Konva.Image>) => params,
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAkwDsC0BRKUMBkBDATwEs0oBiAZTABcACAC3QCUwAzAbQAYBdRKAAOAe1ik6pEWkEgAHogAsigMwA6RQHYArADYVugJwrDAJk0BGbQBoQxRBdMBfJ7dSYceImQpqAkhAANmCUcrB0hHRgaoQcUQBOABRWPDwAlJTu2LgEJORQ-kFgvAJIIKLiktKyCggWKtpqhhY82tqKAByGlqYdurq29ggqqWq6HYq6moqGunoWuooubujZXnm+AArxYEKE8fkMdCIMgSSh4ZHRsQmJpqkZWZ65PgXbu-uHx6ckJbIVEikMjKtVUig0PGUOg6mlMU2MmkGiBGPDGEymMzmugWS1cICeOW8+TURIoDDAuAuESiMTiYCS9wemVWz1JBTZ5NwfzKAKqwNAtU0PFMahUfVMjJ4i1MjiRw1G40m01m80Wy3xLMJGwKABFpGAfq8qVdabdGY9NetXmo9WgDWdXtzhGJAdUQYghSKxboJakpYoZaY5RYOqjlDxDNoUr0ZdoOi48WgRBA4LICVb8v8XXyaogMBY5cY1KZtM0LAGLJYVJpNIZ1emXsSAsEs5UgbmEFpgxMIfoI1Y+jC4-XLY2tjs9gcyd8Ha3Xfz5Ig4bo1B09ELUpoOr1DIo5aZDIY1FKYYtDH1NCZnHiG2ySdrOVA5zn3Qg9EerGYVI4LPUFoZ90PY9xk0M8LyvEcPC1a1bXtbVn3bV8OmrNRywjHQVEUbRWg6DpuxXQwpRjKZtwjFQEycIA */
  id: 'Hen - Egg Laying',
  context: ({ input }) => ({
    henRef: { current: null },
    id: input.id,
    position: input.startPosition,
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
      on: {
        Play: 'Idle',
      },
    },
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
