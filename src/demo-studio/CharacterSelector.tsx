import { Image } from 'react-konva';
import useImage from 'use-image';

/**
 * Character Selector Component
 *
 * Button group for selecting character category (hen, egg, chef).
 * Each button shows a small icon of the character.
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
      <img
        src={getImagePath()}
        alt={getLabel()}
        style={{
          width: '36px',
          height: '36px',
          objectFit: 'contain',
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
