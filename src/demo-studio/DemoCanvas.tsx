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
}: DemoCanvasProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: '#333',
      }}
    >
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
    </div>
  );
}
