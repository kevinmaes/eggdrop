import { useState, useEffect, useRef } from 'react';

import { ChevronRight, BookOpen, Link } from 'lucide-react';

import chefSpriteData from '../images/chef.sprite.json';
import chickSpriteData from '../images/chick.sprite.json';
import eggSpriteData from '../images/egg.sprite.json';
import henSpriteData from '../images/hen.sprite.json';

import { STORYBUK_COLORS, STORYBUK_LAYOUT } from './storybuk-theme';

import type { StoryConfigs } from './types';

/**
 * Story Navigation Sidebar Component
 *
 * Tree structure for navigating stories organized by character category.
 * Features:
 * - Collapsible character folders (Hen, Egg, Chef, Other)
 * - Character sprite icons
 * - Selected story highlighting
 * - Auto-expand folder containing selected story
 */

type CharacterType = 'Hen' | 'Egg' | 'Chef' | 'Other';

interface StoryNavigationProps {
  storyConfigs: StoryConfigs;
  selectedStoryId: string | null;
  onSelectStory: (storyId: string) => void;
}

interface SpriteIconProps {
  imagePath: string;
  frameData: { x: number; y: number; w: number; h: number };
  size?: number;
}

// Single sprite icon component
function SpriteIcon({ imagePath, frameData, size = 18 }: SpriteIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.src = imagePath;

    img.onload = () => {
      ctx.clearRect(0, 0, size, size);

      const baseScale = Math.min(size / frameData.w, size / frameData.h);
      const scale = baseScale;

      const scaledWidth = frameData.w * scale;
      const scaledHeight = frameData.h * scale;

      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;

      ctx.drawImage(
        img,
        frameData.x,
        frameData.y,
        frameData.w,
        frameData.h,
        x,
        y,
        scaledWidth,
        scaledHeight
      );
    };
  }, [imagePath, frameData, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3))',
      }}
    />
  );
}

interface CharacterLabelProps {
  character: CharacterType;
}

// Renders interleaved icon + text labels like: [egg] Egg + [chick] Chick
function CharacterLabel({ character }: CharacterLabelProps) {
  const henFrame = henSpriteData.frames['forward.png']?.frame;
  const eggFrame = eggSpriteData.frames['egg-white.png']?.frame;
  const chickFrame = chickSpriteData.frames['chick-run-right-1.png']?.frame;
  const chefFrame = chefSpriteData.frames['chef-leg-1.png']?.frame;

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  switch (character) {
    case 'Hen':
      if (!henFrame || !eggFrame) return <span>Hen + Egg</span>;
      return (
        <span style={labelStyle}>
          <SpriteIcon imagePath="/images/hen.sprite.png" frameData={henFrame} />
          <span>Hen +</span>
          <SpriteIcon imagePath="/images/egg.sprite.png" frameData={eggFrame} />
          <span>Egg</span>
        </span>
      );
    case 'Egg':
      if (!eggFrame || !chickFrame) return <span>Egg + Chick</span>;
      return (
        <span style={labelStyle}>
          <SpriteIcon imagePath="/images/egg.sprite.png" frameData={eggFrame} />
          <span>Egg +</span>
          <SpriteIcon
            imagePath="/images/chick.sprite.png"
            frameData={chickFrame}
          />
          <span>Chick</span>
        </span>
      );
    case 'Chef':
      if (!chefFrame || !eggFrame) return <span>Chef + Egg</span>;
      return (
        <span style={labelStyle}>
          <SpriteIcon
            imagePath="/images/chef.sprite.png"
            frameData={chefFrame}
          />
          <span>Chef +</span>
          <SpriteIcon imagePath="/images/egg.sprite.png" frameData={eggFrame} />
          <span>Egg</span>
        </span>
      );
    case 'Other':
      return <span>Other</span>;
  }
}

export function StoryNavigation({
  storyConfigs,
  selectedStoryId,
  onSelectStory,
}: StoryNavigationProps) {
  const characters: CharacterType[] = ['Hen', 'Egg', 'Chef', 'Other'];

  // Group stories by character
  const getStoriesByCharacter = (character: CharacterType) => {
    return Object.values(storyConfigs).filter((story) =>
      story.title.startsWith(character)
    );
  };

  // Track which folders are expanded
  const [expandedFolders, setExpandedFolders] = useState<Set<CharacterType>>(
    new Set(characters)
  );

  // Auto-expand folder containing selected story
  useEffect(() => {
    if (selectedStoryId) {
      const selectedStory = storyConfigs[selectedStoryId];
      if (selectedStory) {
        const character = characters.find((char) =>
          selectedStory.title.startsWith(char)
        );
        if (character && !expandedFolders.has(character)) {
          setExpandedFolders(new Set([...expandedFolders, character]));
        }
      }
    }
  }, [selectedStoryId, storyConfigs]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFolder = (character: CharacterType) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(character)) {
      newExpanded.delete(character);
    } else {
      newExpanded.add(character);
    }
    setExpandedFolders(newExpanded);
  };

  return (
    <div
      style={{
        width: STORYBUK_LAYOUT.sidebar.width,
        height: STORYBUK_LAYOUT.sidebar.height,
        backgroundColor: STORYBUK_COLORS.sidebar.background,
        borderRight: `1px solid ${STORYBUK_COLORS.sidebar.border}`,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Logo Header */}
      <div
        style={{
          height: STORYBUK_LAYOUT.sidebar.header.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${STORYBUK_COLORS.sidebar.border}`,
          padding: '1rem',
        }}
      >
        <img
          src="/src/assets/storybuk.svg"
          alt="Storybuk"
          style={{ height: '50px', width: 'auto' }}
        />
      </div>

      {/* Story Navigation Tree */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {characters.map((character) => {
          const stories = getStoriesByCharacter(character);
          if (stories.length === 0) return null;

          const isExpanded = expandedFolders.has(character);

          return (
            <div key={character}>
              {/* Folder Header */}
              <button
                onClick={() => toggleFolder(character)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  background: STORYBUK_COLORS.sidebar.background,
                  cursor: 'pointer',
                  color: STORYBUK_COLORS.sidebar.text,
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    STORYBUK_COLORS.navigation.itemBackgroundHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    STORYBUK_COLORS.sidebar.background;
                }}
              >
                {/* Expand/Collapse Arrow */}
                <ChevronRight
                  size={14}
                  style={{
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s ease',
                    color: STORYBUK_COLORS.sidebar.folderIcon,
                    flexShrink: 0,
                  }}
                />

                {/* Character Label with interleaved icons and text */}
                <CharacterLabel character={character} />
              </button>

              {/* Story List */}
              {isExpanded && (
                <div style={{ paddingLeft: '12px' }}>
                  {stories.map((story) => {
                    const isSelected = story.id === selectedStoryId;

                    return (
                      <button
                        key={story.id}
                        onClick={() => onSelectStory(story.id)}
                        style={{
                          width: '100%',
                          padding: '6px 12px 6px 32px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          border: 'none',
                          borderLeft: '3px solid transparent',
                          background: isSelected ? '#d0d7de' : 'transparent',
                          cursor: 'pointer',
                          color: STORYBUK_COLORS.navigation.itemText,
                          fontSize: '13px',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          outline: 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor =
                              STORYBUK_COLORS.navigation.itemBackgroundHover;
                            e.currentTarget.style.color =
                              STORYBUK_COLORS.navigation.itemTextHover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isSelected
                            ? '#d0d7de'
                            : 'transparent';
                          e.currentTarget.style.color =
                            STORYBUK_COLORS.navigation.itemText;
                        }}
                      >
                        <BookOpen
                          size={14}
                          style={{
                            color: isSelected
                              ? STORYBUK_COLORS.navigation.itemTextActive
                              : STORYBUK_COLORS.sidebar.folderIcon,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ flex: 1 }}>
                          [{story.id}] {story.title}
                        </span>
                        {story.statelyEmbedUrl && (
                          <Link
                            size={12}
                            style={{
                              color: STORYBUK_COLORS.sidebar.folderIcon,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
