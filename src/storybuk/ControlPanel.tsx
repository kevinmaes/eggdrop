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
        padding: '1rem',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#f5f5f5',
      }}
    >
      <button
        onClick={onPlay}
        disabled={isPlaying}
        style={{
          padding: '0.5rem 1rem',
          cursor: isPlaying ? 'not-allowed' : 'pointer',
          opacity: isPlaying ? 0.5 : 1,
        }}
      >
        Play
      </button>
      <button
        onClick={onReset}
        style={{
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        }}
      >
        Reset
      </button>
      <span
        style={{
          marginLeft: 'auto',
          fontSize: '0.875rem',
          color: '#666',
        }}
      >
        {isPlaying ? 'Playing' : 'Ready'}
      </span>
    </div>
  );
}
