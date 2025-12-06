import { Group, Rect, Text } from 'react-konva';

import {
  KEYBOARD_INDICATOR,
  STORYBUK_COLORS,
  STORYBUK_FONTS,
} from '../storybuk-theme';

interface KeyboardIndicatorProps {
  movingDirection: 'left' | 'right' | 'none';
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * KeyboardIndicator Component
 *
 * Displays the current keyboard state synced with actor movement:
 * - "keydown: →" when moving right
 * - "keydown: ←" when moving left
 * - "keyup" when paused (with reduced opacity)
 *
 * Positioned in the top-right corner of the canvas with padding.
 */
export function KeyboardIndicator({
  movingDirection,
  canvasWidth,
}: KeyboardIndicatorProps) {
  const getDisplayParts = (
    direction: 'left' | 'right' | 'none'
  ): { label: string; arrow: string } => {
    if (direction === 'right') return { label: 'keydown: ', arrow: '→' };
    if (direction === 'left') return { label: 'keydown: ', arrow: '←' };
    return { label: 'No key pressed', arrow: '' };
  };

  const { label, arrow } = getDisplayParts(movingDirection);
  const arrowOpacity =
    movingDirection === 'none'
      ? KEYBOARD_INDICATOR.inactiveOpacity
      : KEYBOARD_INDICATOR.activeOpacity;

  // Position in top-right corner with padding
  const groupX =
    canvasWidth - KEYBOARD_INDICATOR.width - KEYBOARD_INDICATOR.padding;
  const groupY = KEYBOARD_INDICATOR.padding;

  return (
    <Group x={groupX} y={groupY}>
      <Rect
        width={KEYBOARD_INDICATOR.width}
        height={KEYBOARD_INDICATOR.height}
        fill={KEYBOARD_INDICATOR.backgroundColor}
        stroke={STORYBUK_COLORS.text.secondary}
        strokeWidth={2}
        cornerRadius={KEYBOARD_INDICATOR.cornerRadius}
      />
      {/* Label text in gray */}
      <Text
        x={12}
        y={15}
        text={label}
        fontSize={KEYBOARD_INDICATOR.textSize}
        fontFamily={STORYBUK_FONTS.base}
        fontStyle="bold"
        fill={STORYBUK_COLORS.text.secondary}
        opacity={arrowOpacity}
      />
      {/* Arrow symbol in darker color */}
      {arrow && (
        <Text
          x={12 + label.length * 10.5}
          y={15}
          text={arrow}
          fontSize={KEYBOARD_INDICATOR.textSize}
          fontFamily={STORYBUK_FONTS.base}
          fontStyle="bold"
          fill={STORYBUK_COLORS.text.primary}
          opacity={arrowOpacity}
        />
      )}
    </Group>
  );
}
