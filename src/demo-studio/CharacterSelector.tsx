import { useEffect, useRef } from 'react';

import henSpriteData from '../../public/images/hen.sprite.json';
import eggSpriteData from '../../public/images/egg.sprite.json';
import chefSpriteData from '../../public/images/chef.sprite.json';

/**
 * Character Selector Component
 *
 * Button group for selecting character category (hen, egg, chef).
 * Each button shows a single cropped frame from the sprite sheet.
 * Only one can be selected at a time.
 */

type CharacterType = 'hen' | 'egg' | 'chef';

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
        return henSpriteData.frames['hen-idle-1.png']?.frame;
      case 'egg':
        return eggSpriteData.frames['egg-white.png']?.frame;
      case 'chef':
        return chefSpriteData.frames['chef-idle-1.png']?.frame;
    }
  };

  const getLabel = () => {
    switch (character) {
      case 'hen':
        return 'Hen';
      case 'egg':
        return 'Egg';
      case 'chef':
        return 'Chef';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = getImagePath();

    img.onload = () => {
      const frameData = getFrameData();
      if (!frameData) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate scale to fit the frame in 40x40 canvas while maintaining aspect ratio
      const scale = Math.min(
        40 / frameData.w,
        40 / frameData.h
      );

      const scaledWidth = frameData.w * scale;
      const scaledHeight = frameData.h * scale;

      // Center the image in the canvas
      const x = (40 - scaledWidth) / 2;
      const y = (40 - scaledHeight) / 2;

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
    };
  }, [character]);

  return (
    <button
      onClick={onClick}
      style={{
        width: '60px',
        height: '60px',
        padding: '4px',
        border: isSelected ? '3px solid #4CAF50' : '2px solid #ccc',
        borderRadius: '4px',
        backgroundColor: isSelected ? '#e8f5e9' : '#fff',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        boxShadow: isSelected ? '0 2px 8px rgba(76, 175, 80, 0.3)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = '#f5f5f5';
          e.currentTarget.style.borderColor = '#999';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = '#fff';
          e.currentTarget.style.borderColor = '#ccc';
        }
      }}
    >
      <canvas
        ref={canvasRef}
        width={40}
        height={40}
        style={{
          imageRendering: 'pixelated',
        }}
      />
      <span
        style={{
          fontSize: '10px',
          marginTop: '2px',
          fontWeight: isSelected ? 'bold' : 'normal',
          color: isSelected ? '#2E7D32' : '#666',
        }}
      >
        {getLabel()}
      </span>
    </button>
  );
}

export function CharacterSelector({
  selectedCharacter,
  onSelectCharacter,
}: CharacterSelectorProps) {
  const characters: CharacterType[] = ['hen', 'egg', 'chef'];

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
