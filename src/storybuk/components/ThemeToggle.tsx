import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

/**
 * Theme Toggle Component
 *
 * Button to toggle between light and dark themes for Stately embeds.
 * Shows sun icon for light mode, moon icon for dark mode.
 */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isLight = theme === 'light';

  return (
    <button
      onClick={onToggle}
      style={{
        padding: '8px 16px',
        backgroundColor: isLight ? '#fff3e0' : '#263238',
        color: isLight ? '#e65100' : '#90caf9',
        border: isLight ? '1px solid #ffb74d' : '1px solid #546e7a',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isLight ? '#ffe0b2' : '#37474f';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isLight ? '#fff3e0' : '#263238';
      }}
      title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
    >
      {isLight ? <Sun size={16} /> : <Moon size={16} />}
      {isLight ? 'Light' : 'Dark'}
    </button>
  );
}
