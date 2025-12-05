import type { BoundingBox } from '../types';

/**
 * Checks if two bounding boxes overlap horizontally (X axis).
 * Returns true if box1 overlaps with box2 on the X axis.
 */
export function hasHorizontalOverlap(
  box1: BoundingBox,
  box2: BoundingBox
): boolean {
  return box1.x < box2.x + box2.width && box1.x + box1.width > box2.x;
}

/**
 * Checks if the leading edge (bottom) of box1 is within the Y range of box2.
 * Useful for detecting when a falling object reaches a target zone.
 */
export function isLeadingEdgeInYRange(
  box1: BoundingBox,
  box2: BoundingBox
): boolean {
  const leadingEdgeY = box1.y + box1.height;
  const targetTop = box2.y;
  const targetBottom = box2.y + box2.height;

  return leadingEdgeY >= targetTop && leadingEdgeY <= targetBottom;
}

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
