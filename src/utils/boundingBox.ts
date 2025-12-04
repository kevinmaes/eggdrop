import type { BoundingBox } from '../types';

/**
 * Checks if two axis-aligned bounding boxes overlap.
 * Uses standard AABB (Axis-Aligned Bounding Box) collision detection.
 * Returns true if the boxes overlap in both X and Y axes.
 */
export function doBoundingBoxesOverlap(
  box1: BoundingBox,
  box2: BoundingBox
): boolean {
  // Check if boxes overlap on X axis
  // Overlap occurs when: box1Left <= box2Right AND box1Right >= box2Left
  // Using <= and >= so that touching edges count as overlap
  const xOverlap =
    box1.x <= box2.x + box2.width && box1.x + box1.width >= box2.x;
  if (!xOverlap) {
    return false;
  }

  // Check if boxes overlap on Y axis
  // Overlap occurs when: box1Top <= box2Bottom AND box1Bottom >= box2Top
  // Using <= and >= so that touching edges count as overlap
  const yOverlap =
    box1.y <= box2.y + box2.height && box1.y + box1.height >= box2.y;

  return yOverlap;
}
