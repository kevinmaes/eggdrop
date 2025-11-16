import { Stage, Layer } from 'react-konva';

import { BackgroundRenderer } from './BackgroundRenderer';

import type { BackgroundConfig, StoryActorInstance } from './types';

interface StoryCanvasProps {
  width: number;
  height: number;
  background: BackgroundConfig;
  actorInstances: StoryActorInstance[];
  resetCount?: number;
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
  width,
  height,
  background,
  actorInstances,
  resetCount = 0,
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
    </div>
  );
}
