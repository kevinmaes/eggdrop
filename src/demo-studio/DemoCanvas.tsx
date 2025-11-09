import { Stage, Layer } from 'react-konva';

import { BackgroundRenderer } from './BackgroundRenderer';

import type { BackgroundConfig, DemoActorInstance } from './types';

interface DemoCanvasProps {
  width?: number;
  height?: number;
  background: BackgroundConfig;
  actorInstances: DemoActorInstance[];
}

/**
 * Konva canvas for rendering demo actors
 *
 * Provides a Stage with:
 * - Background layer (configurable)
 * - Actor layer (dynamically rendered components)
 *
 * Default size: 1280x720 (game resolution)
 */
export function DemoCanvas({
  width = 1280,
  height = 720,
  background,
  actorInstances,
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
              <Component key={config.id || `actor-${index}`} actorRef={actor} />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
