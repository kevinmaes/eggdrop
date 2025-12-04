import { describe, it, expect } from 'vitest';

import { doBoundingBoxesOverlap } from './boundingBox';

import type { BoundingBox } from '../types';

describe('doBoundingBoxesOverlap', () => {
  describe('overlapping boxes', () => {
    it('should return true when boxes fully overlap', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 50, y: 50, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should return true when one box is completely inside the other', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 25, y: 25, width: 50, height: 50 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should return true when boxes touch at edges', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 100, y: 0, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should return true when boxes partially overlap on X and Y', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 75, y: 75, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(true);
    });
  });

  describe('non-overlapping boxes', () => {
    it('should return false when boxes are completely separate on X axis', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 200, y: 0, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(false);
    });

    it('should return false when boxes are completely separate on Y axis', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 0, y: 200, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(false);
    });

    it('should return false when boxes overlap on X but not Y', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 50, y: 200, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(false);
    });

    it('should return false when boxes overlap on Y but not X', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 200, y: 50, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(false);
    });

    it('should return false when boxes are diagonally separated', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 200, y: 200, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return true when boxes are the same', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should return true when boxes touch at corners', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };
      const box2: BoundingBox = { x: 100, y: 100, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should handle zero-width boxes', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 0, height: 100 };
      const box2: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should handle zero-height boxes', () => {
      const box1: BoundingBox = { x: 0, y: 0, width: 100, height: 0 };
      const box2: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should handle negative positions', () => {
      const box1: BoundingBox = { x: -50, y: -50, width: 100, height: 100 };
      const box2: BoundingBox = { x: 0, y: 0, width: 100, height: 100 };

      expect(doBoundingBoxesOverlap(box1, box2)).toBe(true);
    });
  });
});
