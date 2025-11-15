import { Stage, Layer } from 'react-konva';

import { BackgroundRenderer } from './BackgroundRenderer';
import { STORY_CANVAS } from './story-constants';

import type { BackgroundConfig, StoryActorInstance } from './types';

interface StoryCanvasProps {
  width?: number;
  height?: number;
  background: BackgroundConfig;
  actorInstances: StoryActorInstance[];
  resetCount?: number;
  demoTitle?: string;
}

/**
 * Konva canvas for rendering story actors
 *
 * Provides a Stage with:
 * - Background layer (configurable)
 * - Actor layer (dynamically rendered components)
 *
 * Default size from STORY_CANVAS (configurable in story-constants.ts)
 */
export function StoryCanvas({
  width = STORY_CANVAS.width,
  height = STORY_CANVAS.height,
  background,
  actorInstances,
  resetCount = 0,
  demoTitle,
}: StoryCanvasProps) {
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
