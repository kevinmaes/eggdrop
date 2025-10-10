import { vi } from 'vitest';

/**
 * Create a reusable mock Konva.Image for use in a React ref
 * @returns
 */
export function createMockKonvaImage() {
  return {
    x: () => 0,
    y: () => 0,
    // Add any other methods that might be called on the ref
    setPosition: vi.fn(),
  };
}
