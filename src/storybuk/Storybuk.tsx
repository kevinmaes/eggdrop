import { useState } from 'react';

import { useMachine } from '@xstate/react';

import { CharacterSelector } from './CharacterSelector';
import { StatelyEmbed } from './components/StatelyEmbed';
import { ControlPanel } from './ControlPanel';
import InspectorToggle from './InspectorToggle';
import { getStoryConfigs } from './story-configs';
import { PRESENTATION_LAYOUT } from './story-constants';
import { storybukMachine } from './storybuk.machine';
import { StoryButtons } from './StoryButtons';
import { StoryCanvas } from './StoryCanvas';

import type { StoryConfig } from './types';

/**
 * Main Storybuk component
 *
 * Orchestrates the story experience using a state machine:
 * 1. Story selection via StorySelector
 * 2. Dynamic actor loading via state machine
 * 3. Canvas rendering via StoryCanvas
 * 4. Playback controls via ControlPanel
 *
 * Usage:
 * - Select a story from the dropdown
 * - Actors are loaded and started automatically
 * - Use controls to manage playback
 */
type CharacterType = 'hen' | 'egg' | 'chef' | 'other';

export function Storybuk() {
  const [state, send] = useMachine(storybukMachine);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterType>('egg');

  const {
    selectedStoryId,
    layoutMode,
    canvasWidth,
    canvasHeight,
    actorInstances,
    isPlaying,
    resetCount,
    inspectorEnabled,
  } = state.context;

  const isLoading = state.matches('Loading Actors');

  const handleSelectStory = (demoId: string) => {
    send({ type: 'Select story', demoId });
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

  const storyConfigs = getStoryConfigs(canvasWidth, canvasHeight);
  const currentStoryConfig = selectedStoryId
    ? storyConfigs[selectedStoryId]
    : null;
  const statelyUrl = currentStoryConfig?.inspector?.statelyEmbedUrl;

  // Filter stories by selected character
  const getCharacterStories = (character: CharacterType): StoryConfig[] => {
    // Convert character to Title Case for matching (e.g., 'egg' -> 'Egg')
    const titleCaseChar =
      character.charAt(0).toUpperCase() + character.slice(1);
    return Object.values(storyConfigs).filter((demo) =>
      demo.id.startsWith(titleCaseChar)
    );
  };

  const characterStories = getCharacterStories(selectedCharacter);

  const handleSelectCharacter = (character: CharacterType) => {
    setSelectedCharacter(character);
    // Optionally auto-select first story of new character
    const stories = getCharacterStories(character);
    if (stories.length > 0 && stories[0]?.id !== selectedStoryId) {
      handleSelectStory(stories[0]!.id);
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
        {/* Left side: Logo + Character selector + story buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src="/src/assets/storybuk.svg"
            alt="Storybuk"
            style={{ height: '50px', width: 'auto' }}
          />
          <div
            style={{
              width: '1px',
              height: '50px',
              backgroundColor: '#ccc',
            }}
          />
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
          <StoryButtons
            stories={characterStories}
            selectedStoryId={selectedStoryId}
            onSelectStory={handleSelectStory}
          />
        </div>

        {/* Right side: Controls + Inspector toggle */}
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
                      <StatelyEmbed
                        layoutMode={layoutMode}
                        demoTitle={currentStoryConfig.title}
                        statelyUrl={
                          statelyUrl ||
                          'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?machineId=101f821a-03c1-4af1-abbd-e54327548893'
                        }
                      />
                    )}

                    {/* Story Canvas */}
                    {hasVisual && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          backgroundColor: '#000',
                        }}
                      >
                        <StoryCanvas
                          width={canvasWidth}
                          height={canvasHeight}
                          background={currentStoryConfig.background}
                          actorInstances={visualActors}
                          resetCount={resetCount}
                          demoTitle={currentStoryConfig.title}
                        />
                      </div>
                    )}

                    {/* For horizontal-split and vertical-split-top, inspector comes after */}
                    {(isHorizontalSplit || isVerticalSplitTop) && (
                      <StatelyEmbed
                        layoutMode={layoutMode}
                        demoTitle={currentStoryConfig.title}
                        statelyUrl={
                          statelyUrl ||
                          'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?machineId=101f821a-03c1-4af1-abbd-e54327548893'
                        }
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
                              canvasWidth={canvasWidth}
                              canvasHeight={canvasHeight}
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
                  {/* Visual Konva stories */}
                  {hasVisual && (
                    <div
                      style={{
                        flex: hasHeadless ? 1 : 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                      }}
                    >
                      <StoryCanvas
                        width={canvasWidth}
                        height={canvasHeight}
                        background={currentStoryConfig.background}
                        actorInstances={visualActors}
                        resetCount={resetCount}
                        demoTitle={currentStoryConfig.title}
                      />
                    </div>
                  )}

                  {/* Headless inspector stories */}
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
                            canvasWidth={canvasWidth}
                            canvasHeight={canvasHeight}
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
              style={{ width: '1200px', height: 'auto' }}
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
  );
}
