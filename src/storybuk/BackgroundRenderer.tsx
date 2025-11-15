import { Layer, Rect } from 'react-konva';

import type { BackgroundConfig } from './types';

interface BackgroundRendererProps {
  config: BackgroundConfig;
  width: number;
  height: number;
}

/**
 * Renders the background for a story canvas
 *
 * Supports multiple background types:
 * - none: Transparent background
 * - solid: Single color fill
 * - gradient: Linear gradient (future implementation)
 * - image: Background image (future implementation)
 * - game: Full game background (future implementation)
 */
export function BackgroundRenderer({
  config,
  width,
  height,
}: BackgroundRendererProps) {
  if (config.type === 'none') {
    return null;
  }

  if (config.type === 'solid') {
    return (
      <Layer>
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={config.color || '#ffffff'}
        />
      </Layer>
    );
  }

  // Future: image and game backgrounds
  return null;
}
