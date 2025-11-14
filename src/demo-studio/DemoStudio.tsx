import { useState } from 'react';

import { useMachine } from '@xstate/react';

import { CharacterSelector } from './CharacterSelector';
import { InspectorPlaceholder } from './components/InspectorPlaceholder';
import { StatelyEmbed } from './components/StatelyEmbed';
import { ControlPanel } from './ControlPanel';
import { getDemoConfigs } from './demo-configs';
import { PRESENTATION_LAYOUT } from './demo-constants';
import { DemoButtons } from './DemoButtons';
import { DemoCanvas } from './DemoCanvas';
import { demoStudioMachine } from './demoStudio.machine';
import InspectorToggle from './InspectorToggle';

import type { DemoConfig } from './types';

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
type CharacterType = 'hen' | 'egg' | 'chef';

export function DemoStudio() {
  const [state, send] = useMachine(demoStudioMachine);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterType>('egg');
  const [showStatelyEmbed, setShowStatelyEmbed] = useState(false);

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
  const statelyUrl = currentDemoConfig?.inspector?.statelyEmbedUrl;

  // Filter demos by selected character
  const getCharacterDemos = (character: CharacterType): DemoConfig[] => {
    // Convert character to Title Case for matching (e.g., 'egg' -> 'Egg')
    const titleCaseChar =
      character.charAt(0).toUpperCase() + character.slice(1);
    return Object.values(demoConfigs).filter((demo) =>
      demo.id.startsWith(titleCaseChar)
    );
  };

  const characterDemos = getCharacterDemos(selectedCharacter);

  const handleSelectCharacter = (character: CharacterType) => {
    setSelectedCharacter(character);
    // Optionally auto-select first demo of new character
    const demos = getCharacterDemos(character);
    if (demos.length > 0 && demos[0].id !== selectedDemoId) {
      handleSelectDemo(demos[0].id);
    }
  };

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
        {/* Left side: Character selector + demo buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CharacterSelector
            selectedCharacter={selectedCharacter}
            onSelectCharacter={handleSelectCharacter}
          />
          <div
            style={{
              width: '1px',
              height: '50px',
              backgroundColor: '#ccc',
            }}
          />
          <DemoButtons
            demos={characterDemos}
            selectedDemoId={selectedDemoId}
            onSelectDemo={handleSelectDemo}
          />
        </div>

        {/* Right side: Inspector toggle + Stately embed toggle + controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <InspectorToggle
            inspectorEnabled={inspectorEnabled}
            onToggle={handleToggleInspector}
          />
          <button
            onClick={() => setShowStatelyEmbed(!showStatelyEmbed)}
            style={{
              padding: '8px 12px',
              backgroundColor: showStatelyEmbed ? '#4a90e2' : '#2c2c2c',
              color: '#e0e0e0',
              border: '1px solid #444',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {showStatelyEmbed ? 'Hide' : 'Show'} Stately Embed
          </button>
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
                    {isVerticalSplitBottom &&
                      (showStatelyEmbed ? (
                        <StatelyEmbed
                          layoutMode={layoutMode}
                          demoTitle={currentDemoConfig.title}
                          statelyUrl={statelyUrl}
                        />
                      ) : (
                        <InspectorPlaceholder
                          layoutMode={layoutMode}
                          demoTitle={currentDemoConfig.title}
                        />
                      ))}

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
                    {(isHorizontalSplit || isVerticalSplitTop) &&
                      (showStatelyEmbed ? (
                        <StatelyEmbed
                          layoutMode={layoutMode}
                          demoTitle={currentDemoConfig.title}
                          statelyUrl={statelyUrl}
                        />
                      ) : (
                        <InspectorPlaceholder
                          layoutMode={layoutMode}
                          demoTitle={currentDemoConfig.title}
                        />
                      ))}

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
