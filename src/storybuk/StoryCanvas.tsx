import { useSelector } from '@xstate/react';
import { Stage, Layer } from 'react-konva';

import { BackgroundRenderer } from './BackgroundRenderer';
import { KeyboardIndicator } from './components/KeyboardIndicator';

import type { BackgroundConfig, StoryActorInstance } from './types';

interface StoryCanvasProps {
  width: number;
  height: number;
  background: BackgroundConfig;
  actorInstances: StoryActorInstance[];
  resetCount?: number;
  showKeyboardIndicator?: boolean;
}

/**
 * Konva canvas for rendering story actors
 *
 * Provides a Stage with:
 * - Background layer (configurable)
 * - Actor layer (dynamically rendered components)
 * - Optional keyboard indicator overlay
 *
 * Default size from STORY_CANVAS (configurable in story-constants.ts)
 */
export function StoryCanvas({
  width,
  height,
  background,
  actorInstances,
  resetCount = 0,
  showKeyboardIndicator = false,
}: StoryCanvasProps) {
  // Always call useSelector to comply with React hooks rules
  // Use a fallback empty object when no actor exists
  const firstActor = actorInstances[0]?.actor ?? ({} as any);
  const movingDirection = useSelector(firstActor, (state) => {
    if (!state || typeof state !== 'object' || !('context' in state)) {
      return 'none';
    }
    const ctx = state.context as any;
    return ctx?.movingDirection ?? 'none';
  });

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
          {showKeyboardIndicator && (
            <KeyboardIndicator
              movingDirection={movingDirection}
              canvasWidth={width}
              canvasHeight={height}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
