import { useEffect, useRef } from 'react';

import chefSpriteData from '../../public/images/chef.sprite.json';
import eggSpriteData from '../../public/images/egg.sprite.json';
import henSpriteData from '../../public/images/hen.sprite.json';
import { STORYBUK_COLORS } from './storybuk-theme';

/**
 * Character Selector Component
 *
 * Button group for selecting character category (hen, egg, chef).
 * Each button shows a single cropped frame from the sprite sheet.
 * Only one can be selected at a time.
 */

type CharacterType = 'hen' | 'egg' | 'chef' | 'other';

interface CharacterSelectorProps {
  selectedCharacter: CharacterType | null;
  onSelectCharacter: (character: CharacterType) => void;
}

function CharacterButton({
  character,
  isSelected,
  onClick,
}: {
  character: CharacterType;
  isSelected: boolean;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getImagePath = () => {
      switch (character) {
        case 'hen':
          return '/images/hen.sprite.png';
        case 'egg':
          return '/images/egg.sprite.png';
        case 'chef':
          return '/images/chef.sprite.png';
      }
    };

    const getFrameData = () => {
      switch (character) {
        case 'hen':
          return henSpriteData.frames['forward.png']?.frame;
        case 'egg':
          return eggSpriteData.frames['egg-white.png']?.frame;
        case 'chef':
          return chefSpriteData.frames['chef-leg-1.png']?.frame;
        case 'other':
          return null; // Will render text instead
      }
    };

    const img = new window.Image();
    img.src = getImagePath();

    const frameData = getFrameData();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (character === 'other') {
      // Render text for "Other" button
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('...', 28, 28);
      return;
    }

    if (!frameData) return;

    img.onload = () => {
      // Clear canvas again for image render
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate scale to fit the frame in 56x56 canvas while maintaining aspect ratio
      // Egg is smaller than hen/chef in real life, so scale it down to 60% size
      const baseScale = Math.min(56 / frameData.w, 56 / frameData.h);
      const scale = character === 'egg' ? baseScale * 0.6 : baseScale;

      const scaledWidth = frameData.w * scale;
      const scaledHeight = frameData.h * scale;

      // Center the image in the canvas
      const x = (56 - scaledWidth) / 2;
      const y = (56 - scaledHeight) / 2;

      // Flip chef horizontally to match story facing direction
      if (character === 'chef') {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
          img,
          frameData.x,
          frameData.y,
          frameData.w,
          frameData.h,
          -x - scaledWidth,
          y,
          scaledWidth,
          scaledHeight
        );
        ctx.restore();
      } else {
        // Draw the cropped sprite frame
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
      }
    };
  }, [character]);

  return (
    <button
      onClick={onClick}
      style={{
        width: '60px',
        height: '60px',
        padding: '2px',
        border: isSelected
          ? `3px solid ${STORYBUK_COLORS.navigation.itemBorderActive}`
          : `2px solid ${STORYBUK_COLORS.header.border}`,
        borderRadius: '4px',
        backgroundColor: isSelected
          ? STORYBUK_COLORS.navigation.itemBackgroundActive
          : STORYBUK_COLORS.navigation.itemBackground,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        boxShadow: isSelected
          ? `0 2px 8px ${STORYBUK_COLORS.navigation.itemBorderActive}40`
          : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor =
            STORYBUK_COLORS.navigation.itemBorderActive;
          e.currentTarget.style.backgroundColor =
            STORYBUK_COLORS.navigation.itemBackgroundHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = STORYBUK_COLORS.header.border;
          e.currentTarget.style.backgroundColor =
            STORYBUK_COLORS.navigation.itemBackground;
        }
      }}
    >
      <canvas
        ref={canvasRef}
        width={56}
        height={56}
        style={{
          imageRendering: 'pixelated',
        }}
      />
    </button>
  );
}

export function CharacterSelector({
  selectedCharacter,
  onSelectCharacter,
}: CharacterSelectorProps) {
  const characters: CharacterType[] = ['hen', 'egg', 'chef', 'other'];

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}
    >
      {characters.map((character) => (
        <CharacterButton
          key={character}
          character={character}
          isSelected={selectedCharacter === character}
          onClick={() => onSelectCharacter(character)}
        />
      ))}
    </div>
  );
}
