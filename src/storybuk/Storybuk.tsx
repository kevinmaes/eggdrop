import { useMachine } from '@xstate/react';
import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/600.css';
import '@fontsource/nunito-sans/700.css';

import { StatelyEmbed } from './components/StatelyEmbed';
import { ControlPanel } from './ControlPanel';
import InspectorToggle from './InspectorToggle';
import { getStoryConfigs } from './story-configs';
import { StoryCanvas } from './StoryCanvas';
import { StoryNavigation } from './StoryNavigation';
import { storybukMachine } from './storybuk.machine';
import { STORYBUK_COLORS, STORYBUK_LAYOUT, STORYBUK_FONTS } from './storybuk-theme';

/**
 * Main Storybuk component
 *
 * Orchestrates the story experience using a state machine:
 * 1. Story selection via StoryNavigation sidebar
 * 2. Dynamic actor loading via state machine
 * 3. Canvas rendering via StoryCanvas
 * 4. Stately embed for state chart visualization
 * 5. Playback controls via ControlPanel
 * 6. Inspector toggle for headless actors
 *
 * Layout: 1920×1080
 * - Header: 60px (Logo + Controls)
 * - Sidebar: 300px (Story navigation)
 * - Content: 1620×1020 (Split based on layoutOrientation)
 */

export function Storybuk() {
  const [state, send] = useMachine(storybukMachine);

  const {
    selectedStoryId,
    canvasWidth,
    canvasHeight,
    actorInstances,
    isPlaying,
    resetCount,
    inspectorEnabled,
  } = state.context;

  const isLoading = state.matches('Loading Actors');

  const handleSelectStory = (storyId: string) => {
    send({ type: 'Select story', demoId: storyId });
  };

  const handlePlay = () => {
    // Start all visual (Konva) actors
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

  const storyConfigs = getStoryConfigs(canvasWidth, canvasHeight);
  const currentStoryConfig = selectedStoryId
    ? storyConfigs[selectedStoryId]
    : null;

  const layoutOrientation = currentStoryConfig?.layoutOrientation;
  const statelyUrl = currentStoryConfig?.inspector?.statelyEmbedUrl;

  // Get dynamic dimensions based on layout orientation
  const getLayoutDimensions = () => {
    if (layoutOrientation === 'split-horizontal') {
      return STORYBUK_LAYOUT['split-horizontal'];
    }
    return STORYBUK_LAYOUT['split-vertical'];
  };

  const layoutDimensions = getLayoutDimensions();

  return (
    <div
      style={{
        width: STORYBUK_LAYOUT.total.width,
        height: STORYBUK_LAYOUT.total.height,
        display: 'flex',
        backgroundColor: '#ffffff',
        fontFamily: STORYBUK_FONTS.base,
      }}
    >
      {/* Story Navigation Sidebar - Full Height */}
      <StoryNavigation
        storyConfigs={storyConfigs}
        selectedStoryId={selectedStoryId}
        onSelectStory={handleSelectStory}
      />

      {/* Right Side: Header + Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header - Right Side Only */}
        <div
          style={{
            height: STORYBUK_LAYOUT.header.height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 1rem',
            backgroundColor: STORYBUK_COLORS.header.background,
            borderBottom: `1px solid ${STORYBUK_COLORS.header.border}`,
          }}
        >
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ControlPanel
              onPlay={handlePlay}
              onReset={handleReset}
              isPlaying={isPlaying}
            />
            <InspectorToggle
              inspectorEnabled={inspectorEnabled}
              onToggle={handleToggleInspector}
            />
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            width: STORYBUK_LAYOUT.contentArea.width,
            height: STORYBUK_LAYOUT.contentArea.height,
            display: 'flex',
            flexDirection:
              layoutOrientation === 'split-horizontal' ? 'row' : 'column',
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
              Loading story...
            </div>
          )}

          {!isLoading && currentStoryConfig && (
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
                  <>
                    {/* Story Canvas */}
                    {hasVisual && (
                      <div
                        style={{
                          width: layoutDimensions.storyCanvas.width,
                          height: layoutDimensions.storyCanvas.height,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: STORYBUK_COLORS.content.canvasBackground,
                        }}
                      >
                        <StoryCanvas
                          width={layoutDimensions.storyCanvas.width}
                          height={layoutDimensions.storyCanvas.height}
                          background={currentStoryConfig.background}
                          actorInstances={visualActors}
                          resetCount={resetCount}
                          demoTitle={currentStoryConfig.title}
                        />
                      </div>
                    )}

                    {/* Stately Embed */}
                    <div
                      style={{
                        width: layoutDimensions.statelyEmbed.width,
                        height: layoutDimensions.statelyEmbed.height,
                      }}
                    >
                      <StatelyEmbed
                        width={layoutDimensions.statelyEmbed.width}
                        height={layoutDimensions.statelyEmbed.height}
                        demoTitle={currentStoryConfig.title}
                        statelyUrl={
                          statelyUrl ||
                          'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?machineId=101f821a-03c1-4af1-abbd-e54327548893'
                        }
                      />
                    </div>

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
                              canvasWidth={canvasWidth}
                              canvasHeight={canvasHeight}
                            />
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}

          {!isLoading && !currentStoryConfig && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem',
              }}
            >
              <img
                src="/src/assets/storybuk.svg"
                alt="Storybuk"
                style={{ width: '800px', height: 'auto', opacity: 1 }}
              />
              <div
                style={{
                  fontSize: '1.5rem',
                  color: '#666',
                }}
              >
                Select a story to begin
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
