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
					// Immediately call onFinish if it exists
					if (this.onFinish) {
						this.onFinish();
					}
					return this;
				}
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

// Create a simple mock for React refs that can be used in tests
class MockRef<T> {
	current: T | null = null;
}

// Add to global
(global as any).React = {
	createRef: () => new MockRef(),
};
