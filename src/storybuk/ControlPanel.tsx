import { Play, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  onPlay?: () => void;
  onReset?: () => void;
  isPlaying?: boolean;
}

/**
 * Control panel for story playback
 *
 * Provides basic controls for managing story state:
 * - Play: Start actor animations
 * - Reset: Reload current story from beginning
 */
export function ControlPanel({
  onPlay,
  onReset,
  isPlaying = false,
}: ControlPanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
      }}
    >
      <button
        onClick={onPlay}
        disabled={isPlaying}
        style={{
          padding: '6px 12px',
          cursor: isPlaying ? 'not-allowed' : 'pointer',
          opacity: isPlaying ? 0.5 : 1,
          backgroundColor: '#2196F3',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Play size={16} />
        Play
      </button>
      <button
        onClick={onReset}
        style={{
          padding: '6px 12px',
          cursor: 'pointer',
          backgroundColor: '#ffffff',
          color: '#333333',
          border: '1px solid #e8e8e8',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <RotateCcw size={16} />
        Reset
      </button>
    </div>
  );
}
