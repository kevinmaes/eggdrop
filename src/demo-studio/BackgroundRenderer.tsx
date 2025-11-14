import { Layer, Rect } from 'react-konva';

import type { BackgroundConfig } from './types';

interface BackgroundRendererProps {
  config: BackgroundConfig;
  width: number;
  height: number;
}

/**
 * Renders the background for a demo canvas
 *
 * Supports multiple background types:
 * - none: Transparent background
 * - solid: Single color fill
 * - stage: Background with stage/ground at bottom
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

  if (config.type === 'stage') {
    const stageHeightPercent = config.stageHeightPercent || 0.4;
    const stageHeight = height * stageHeightPercent;
    const stageY = height - stageHeight;

    return (
      <Layer>
        {/* Background fill */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={config.color || '#2c5f7f'}
        />
        {/* Stage/ground at bottom */}
        <Rect
          x={0}
          y={stageY}
          width={width}
          height={stageHeight}
          fill={config.stageColor || '#654321'}
        />
      </Layer>
    );
  }

  // Future: Implement gradient rendering
  // if (config.type === 'gradient') {
  //   const startColor = config.gradient?.start || '#ffffff';
  //   const endColor = config.gradient?.end || '#cccccc';
  //   const direction = config.gradient?.direction || 'vertical';
  //   const gradientStart =
  //     direction === 'vertical' ? { x: 0, y: 0 } : { x: 0, y: 0 };
  //   const gradientEnd =
  //     direction === 'vertical' ? { x: 0, y: height } : { x: width, y: 0 };
  //   return (
  //     <Layer>
  //       <Rect
  //         x={0}
  //         y={0}
  //         width={width}
  //         height={height}
  //         fillLinearGradientStartPoint={gradientStart}
  //         fillLinearGradientEndPoint={gradientEnd}
  //         fillLinearGradientColorStops={[0, startColor, 1, endColor]}
  //       />
  //     </Layer>
  //   );
  // }

  // Future: image and game backgrounds
  return null;
}
