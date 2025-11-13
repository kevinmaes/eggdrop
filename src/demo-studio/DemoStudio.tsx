import { useMachine } from '@xstate/react';

import { InspectorPlaceholder } from './components/InspectorPlaceholder';
import { ControlPanel } from './ControlPanel';
import { getDemoConfigs } from './demo-configs';
import { PRESENTATION_LAYOUT } from './demo-constants';
import { DemoCanvas } from './DemoCanvas';
import { DemoSelector } from './DemoSelector';
import { demoStudioMachine } from './demoStudio.machine';
import InspectorToggle from './InspectorToggle';

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
    layoutMode,
    canvasWidth,
    canvasHeight,
    actorInstances,
    isPlaying,
    resetCount,
    inspectorEnabled,
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

  const handleReset = () => {
    send({ type: 'Reset' });
  };

  const handleToggleInspector = () => {
    send({ type: 'Toggle inspector' });
  };

  const demoConfigs = getDemoConfigs(canvasWidth, canvasHeight);
  const currentDemoConfig = selectedDemoId ? demoConfigs[selectedDemoId] : null;

  const isPresentationMode = layoutMode !== null;
  // Always use presentation layout dimensions for consistency
  const containerDimensions = PRESENTATION_LAYOUT.total;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Controls - outside presentation area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#f0f0f0',
          borderBottom: '1px solid #ccc',
        }}
      >
        <DemoSelector
          demoConfigs={demoConfigs}
          currentDemoId={selectedDemoId}
          onSelect={handleSelectDemo}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <InspectorToggle
            inspectorEnabled={inspectorEnabled}
            onToggle={handleToggleInspector}
          />
          <ControlPanel
            onPlay={handlePlay}
            onReset={handleReset}
            isPlaying={isPlaying}
          />
        </div>
      </div>

      {/* Presentation area - exactly 1920x1080 */}
      <div
        style={{
          width: containerDimensions.width,
          height: containerDimensions.height,
          margin: '0 auto',
          backgroundColor: '#000',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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

              if (isPresentationMode && layoutMode) {
                const isHorizontalSplit =
                  layoutMode === 'horizontal-split' ||
                  layoutMode === 'horizontal-split-narrow';
                const isVerticalSplitTop = layoutMode === 'vertical-split-top';
                const isVerticalSplitBottom =
                  layoutMode === 'vertical-split-bottom';

                return (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: isHorizontalSplit ? 'row' : 'column',
                      flex: 1,
                      overflow: 'hidden',
                    }}
                  >
                    {/* For vertical-split-bottom, inspector comes first */}
                    {isVerticalSplitBottom && (
                      <InspectorPlaceholder
                        layoutMode={layoutMode}
                        demoTitle={currentDemoConfig.title}
                      />
                    )}

                    {/* Demo Canvas */}
                    {hasVisual && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          backgroundColor: '#000',
                        }}
                      >
                        <DemoCanvas
                          width={canvasWidth}
                          height={canvasHeight}
                          background={currentDemoConfig.background}
                          actorInstances={visualActors}
                          resetCount={resetCount}
                          demoTitle={currentDemoConfig.title}
                        />
                      </div>
                    )}

                    {/* For horizontal-split and vertical-split-top, inspector comes after */}
                    {(isHorizontalSplit || isVerticalSplitTop) && (
                      <InspectorPlaceholder
                        layoutMode={layoutMode}
                        demoTitle={currentDemoConfig.title}
                      />
                    )}

                    {/* Headless actors (hidden, for inspector only) */}
                    {hasHeadless && (
                      <div style={{ display: 'none' }}>
                        {headlessActors.map((instance, index) => {
                          const { Component, config } = instance;
                          return (
                            <Component
                              key={`${config.id || `actor-${index}`}-${resetCount}`}
                              config={config}
                              resetCount={resetCount}
                              shouldStart={isPlaying}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Non-presentation mode (original layout)
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
                        height={canvasHeight}
                        background={currentDemoConfig.background}
                        actorInstances={visualActors}
                        resetCount={resetCount}
                        demoTitle={currentDemoConfig.title}
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
                            key={`${config.id || `actor-${index}`}-${resetCount}`}
                            config={config}
                            resetCount={resetCount}
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
    </div>
  );
}
