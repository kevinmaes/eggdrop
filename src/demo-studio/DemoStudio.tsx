import { useMachine } from '@xstate/react';

import { ControlPanel } from './ControlPanel';
import { getDemoConfigs } from './demo-configs';
import { DemoCanvas } from './DemoCanvas';
import { DemoSelector } from './DemoSelector';
import { demoStudioMachine } from './demoStudio.machine';

/**
 * Main Demo Studio component
 *
 * Orchestrates the demo experience using a state machine:
 * 1. Demo selection via DemoSelector
 * 2. Dynamic actor loading via state machine
 * 3. Canvas rendering via DemoCanvas
 * 4. Playback controls via ControlPanel
 *
 * Usage:
 * - Select a demo from the dropdown
 * - Actors are loaded and started automatically
 * - Use controls to manage playback
 */
export function DemoStudio() {
  const [state, send] = useMachine(demoStudioMachine);

  const {
    selectedDemoId,
    canvasWidth,
    canvasHeight,
    actorInstances,
    isPlaying,
  } = state.context;

  const isLoading = state.matches('Loading Actors');

  const handleSelectDemo = (demoId: string) => {
    send({ type: 'Select demo', demoId });
  };

  const handleCanvasWidthChange = (width: number) => {
    send({ type: 'Change canvas width', width });
  };

  const handlePlay = () => {
    // Start all visual (Konva) actors
    // henRef should already be set by component useEffect
    actorInstances.forEach((instance) => {
      if (
        instance.actor &&
        !instance.config.componentVersion?.includes('headless')
      ) {
        instance.actor.start();
      }
    });

    // Update isPlaying state to start headless actors
    send({ type: 'Play' });
  };

  const handlePause = () => {
    send({ type: 'Pause' });
  };

  const handleReset = () => {
    send({ type: 'Reset' });
  };

  const demoConfigs = getDemoConfigs(canvasWidth, canvasHeight);
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
        onSelect={handleSelectDemo}
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
            onClick={() => handleCanvasWidthChange(1280)}
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
            onClick={() => handleCanvasWidthChange(640)}
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
        <>
          {/* Separate headless and visual actors */}
          {(() => {
            const headlessActors = actorInstances.filter((instance) =>
              instance.config.componentVersion?.includes('headless')
            );
            const visualActors = actorInstances.filter(
              (instance) =>
                !instance.config.componentVersion?.includes('headless')
            );

            const hasHeadless = headlessActors.length > 0;
            const hasVisual = visualActors.length > 0;

            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '1rem',
                  flex: 1,
                  padding: '1rem',
                }}
              >
                {/* Visual Konva demos */}
                {hasVisual && (
                  <div
                    style={{
                      flex: hasHeadless ? 1 : 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                    }}
                  >
                    <DemoCanvas
                      width={canvasWidth}
                      height={720}
                      background={currentDemoConfig.background}
                      actorInstances={visualActors}
                    />
                  </div>
                )}

                {/* Headless inspector demos */}
                {hasHeadless && (
                  <div
                    style={{
                      flex: hasVisual ? 1 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    {headlessActors.map((instance, index) => {
                      const { Component, config } = instance;
                      return (
                        <Component
                          key={config.id || `actor-${index}`}
                          config={config}
                          shouldStart={isPlaying}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </>
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
