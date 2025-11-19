// This file is used to set up the test environment
// It will be run before each test file

import { vi } from 'vitest';

// Mock Konva since we don't need actual rendering in our tests
vi.mock('konva', () => {
  return {
    default: {
      Tween: class MockTween {
        onFinish: (() => void) | undefined;

        constructor(config: any) {
          // Store config for testing
          Object.assign(this, config);
        }

        play() {
          setTimeout(() => {
            // Immediately call onFinish if it exists
            // (but wait for next event tick to allow onFinish event handlers to be attached)
            if (this.onFinish) {
              this.onFinish();
            }
          }, 0);

          return this;
        }

        destroy() {}
      },
      Easings: {
        EaseOut: 'easeOut',
      },
      Animation: class MockAnimation {
        constructor() {}
        start() {
          return this;
        }
        stop() {
          return this;
        }
      },
    },
  };
});

// Add mock for konva/lib/Animation
vi.mock('konva/lib/Animation', () => {
  return {
    Animation: class MockAnimation {
      constructor() {}
      start() {
        return this;
      }
      stop() {
        return this;
      }
    },
  };
});

// Create a simple mock for React refs that can be used in tests
class MockRef<T> {
  current: T | null = null;
}

// Add to global
(global as any).React = {
  createRef: () => new MockRef(),
};

// Define mocks before any tests run
const mockHowler = {
  mute: vi.fn(),
  volume: vi.fn(),
  stop: vi.fn(),
  unload: vi.fn(),
};

const mockHowlInstance = {
  play: vi.fn().mockReturnValue(1),
  stop: vi.fn(),
  pause: vi.fn(),
  volume: vi.fn(),
  mute: vi.fn(),
  seek: vi.fn(),
  loop: vi.fn(),
  state: vi.fn().mockReturnValue('loaded'),
  playing: vi.fn(),
  duration: vi.fn().mockReturnValue(1),
};

const mockHowl = vi.fn(function MockHowl(this: unknown) {
  return mockHowlInstance;
});

vi.mock('howler', () => ({
  Howler: mockHowler,
  Howl: mockHowl,
}));
