import type { RefObject } from 'react';

import type Konva from 'konva';

export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  value: -1 | 0 | 1;
  label: 'left' | 'right' | 'none';
}

/**
 * Type assertion for a React ref for Konva.Image
 * @param imageRef
 * @returns
 */
export function isImageRef(
  imageRef: unknown
): imageRef is RefObject<Konva.Image> {
  if (imageRef) {
    return true;
  }
  return false;
}
