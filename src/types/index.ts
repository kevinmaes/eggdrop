import type { RefObject } from 'react';

import type Konva from 'konva';

// Utility type: Require at least one property from T
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

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
