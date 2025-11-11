import { Stage, Layer } from 'react-konva';

import { BackgroundRenderer } from './BackgroundRenderer';
import { DEMO_CANVAS } from './demo-constants';

import type { BackgroundConfig, DemoActorInstance } from './types';

interface DemoCanvasProps {
  width?: number;
  height?: number;
  background: BackgroundConfig;
  actorInstances: DemoActorInstance[];
  resetCount?: number;
  demoTitle?: string;
}

/**
 * Konva canvas for rendering demo actors
 *
 * Provides a Stage with:
 * - Background layer (configurable)
 * - Actor layer (dynamically rendered components)
 *
 * Default size from DEMO_CANVAS (configurable in demo-constants.ts)
 */
export function DemoCanvas({
  width = DEMO_CANVAS.width,
  height = DEMO_CANVAS.height,
  background,
  actorInstances,
  resetCount = 0,
  demoTitle,
}: DemoCanvasProps) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Stage width={width} height={height}>
        <BackgroundRenderer config={background} width={width} height={height} />
        <Layer>
          {actorInstances.map((instance, index) => {
            const { Component, actor, config } = instance;
            return (
              <Component
                key={`${config.id || `actor-${index}`}-${resetCount}`}
                actorRef={actor}
              />
            );
          })}
        </Layer>
      </Stage>
      {demoTitle && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '16px',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'monospace',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {demoTitle}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '0',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          userSelect: 'none',
          textAlign: 'right',
          paddingRight: '16px',
          maxWidth: '250px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {width}×{height}px
      </div>
    </div>
  );
}
