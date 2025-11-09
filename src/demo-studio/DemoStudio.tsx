import { useState, useEffect } from 'react';

import { createDemoActor } from './ActorFactory';
import { ControlPanel } from './ControlPanel';
import { getDemoConfigs } from './demo-configs';
import { DemoCanvas } from './DemoCanvas';
import { DemoSelector } from './DemoSelector';

import type { DemoActorInstance } from './types';

/**
 * Main Demo Studio component
 *
 * Orchestrates the demo experience:
 * 1. Demo selection via DemoSelector
 * 2. Dynamic actor loading via ActorFactory
 * 3. Canvas rendering via DemoCanvas
 * 4. Playback controls via ControlPanel
 *
 * Usage:
 * - Select a demo from the dropdown
 * - Actors are loaded and started automatically
 * - Use controls to manage playback (future implementation)
 */
export function DemoStudio() {
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [actorInstances, setActorInstances] = useState<DemoActorInstance[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState<number>(1280);

  // Load actors when demo selection or canvas width changes
  useEffect(() => {
    if (!selectedDemoId) {
      setActorInstances([]);
      return;
    }

    const demoConfigs = getDemoConfigs(canvasWidth, 720);
    const demoConfig = demoConfigs[selectedDemoId];
    if (!demoConfig) {
      console.error(`Demo config not found for: ${selectedDemoId}`);
      return;
    }

    let cancelled = false;

    const loadActors = async () => {
      setIsLoading(true);
      try {
        const instances = await Promise.all(
          demoConfig.actors.map((actorConfig) => createDemoActor(actorConfig))
        );

        if (!cancelled) {
          setActorInstances(instances);
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Failed to load actors:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadActors();

    // Cleanup: stop actors when unmounting or changing demos
    return () => {
      cancelled = true;
      actorInstances.forEach((instance) => {
        instance.actor.stop();
      });
    };
  }, [selectedDemoId, canvasWidth]);

  const handlePlay = () => {
    // Future: Send play event to actors
    setIsPlaying(true);
  };

  const handlePause = () => {
    // Future: Send pause event to actors
    setIsPlaying(false);
  };

  const handleReset = () => {
    // Future: Reset actors to initial state
    setSelectedDemoId(null);
  };

  const demoConfigs = getDemoConfigs(canvasWidth, 720);
  const currentDemoConfig = selectedDemoId ? demoConfigs[selectedDemoId] : null;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DemoSelector
        demoConfigs={demoConfigs}
        currentDemoId={selectedDemoId}
        onSelect={setSelectedDemoId}
      />
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#f0f0f0',
          borderBottom: '1px solid #ccc',
        }}
      >
        <ControlPanel
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          isPlaying={isPlaying}
        />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
            Canvas width:
          </span>
          <button
            onClick={() => setCanvasWidth(1280)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: canvasWidth === 1280 ? '#4CAF50' : '#e0e0e0',
              color: canvasWidth === 1280 ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: canvasWidth === 1280 ? 'bold' : 'normal',
            }}
          >
            Full (1280)
          </button>
          <button
            onClick={() => setCanvasWidth(640)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: canvasWidth === 640 ? '#4CAF50' : '#e0e0e0',
              color: canvasWidth === 640 ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: canvasWidth === 640 ? 'bold' : 'normal',
            }}
          >
            Half (640)
          </button>
        </div>
      </div>
      {isLoading && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#666',
          }}
        >
          Loading demo...
        </div>
      )}
      {!isLoading && currentDemoConfig && (
        <DemoCanvas
          width={canvasWidth}
          height={720}
          background={currentDemoConfig.background}
          actorInstances={actorInstances}
        />
      )}
      {!isLoading && !currentDemoConfig && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#666',
          }}
        >
          Select a demo to begin
        </div>
      )}
    </div>
  );
}
