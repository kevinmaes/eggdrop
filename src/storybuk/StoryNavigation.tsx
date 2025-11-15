import { useState, useEffect, useRef } from 'react';

import chefSpriteData from '../../public/images/chef.sprite.json';
import eggSpriteData from '../../public/images/egg.sprite.json';
import henSpriteData from '../../public/images/hen.sprite.json';
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

interface CharacterIconProps {
  character: CharacterType;
  size?: number;
}

function CharacterIcon({ character, size = 20 }: CharacterIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getImagePath = () => {
      switch (character) {
        case 'Hen':
          return '/images/hen.sprite.png';
        case 'Egg':
          return '/images/egg.sprite.png';
        case 'Chef':
          return '/images/chef.sprite.png';
        case 'Other':
          return null; // Will render text instead
      }
    };

    const getFrameData = () => {
      switch (character) {
        case 'Hen':
          return henSpriteData.frames['forward.png']?.frame;
        case 'Egg':
          return eggSpriteData.frames['egg-white.png']?.frame;
        case 'Chef':
          return chefSpriteData.frames['chef-leg-1.png']?.frame;
        case 'Other':
          return null;
      }
    };

    const imagePath = getImagePath();
    if (!imagePath) {
      // Render text for "Other"
      ctx.fillStyle = STORYBUK_COLORS.sidebar.folderIcon;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('...', size / 2, size / 2);
      return;
    }

    const img = new window.Image();
    img.src = imagePath;

    const frameData = getFrameData();
    if (!frameData) return;

    img.onload = () => {
      ctx.clearRect(0, 0, size, size);

      // Calculate scale to fit frame in canvas
      const baseScale = Math.min(size / frameData.w, size / frameData.h);
      const scale = character === 'Egg' ? baseScale * 0.6 : baseScale;

      const scaledWidth = frameData.w * scale;
      const scaledHeight = frameData.h * scale;

      // Center the image
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;

      // Draw the sprite frame
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
  }, [character, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated' }}
    />
  );
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
      story.id.startsWith(character)
    );
  };

  // Track which folders are expanded
  const [expandedFolders, setExpandedFolders] = useState<Set<CharacterType>>(
    new Set(characters)
  );

  // Auto-expand folder containing selected story
  useEffect(() => {
    if (selectedStoryId) {
      const character = characters.find((char) =>
        selectedStoryId.startsWith(char)
      );
      if (character && !expandedFolders.has(character)) {
        setExpandedFolders(new Set([...expandedFolders, character]));
      }
    }
  }, [selectedStoryId]); // eslint-disable-line react-hooks/exhaustive-deps

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
        height: STORYBUK_LAYOUT.contentArea.height,
        backgroundColor: STORYBUK_COLORS.sidebar.background,
        borderRight: `1px solid ${STORYBUK_COLORS.sidebar.border}`,
        overflow: 'auto',
        fontFamily: 'sans-serif',
      }}
    >
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
                background: 'transparent',
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
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Expand/Collapse Arrow */}
              <span
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                }}
              >
                ▶
              </span>

              {/* Character Icon */}
              <CharacterIcon character={character} size={20} />

              {/* Character Name */}
              <span>{character}</span>
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
                        alignItems: 'center',
                        border: 'none',
                        borderLeft: isSelected
                          ? `3px solid ${STORYBUK_COLORS.navigation.itemBorderActive}`
                          : '3px solid transparent',
                        background: isSelected
                          ? STORYBUK_COLORS.navigation.itemBackgroundActive
                          : 'transparent',
                        cursor: 'pointer',
                        color: isSelected
                          ? STORYBUK_COLORS.navigation.itemTextActive
                          : STORYBUK_COLORS.navigation.itemText,
                        fontSize: '13px',
                        textAlign: 'left',
                        transition: 'all 0.2s',
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
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color =
                            STORYBUK_COLORS.navigation.itemText;
                        }
                      }}
                    >
                      {story.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
