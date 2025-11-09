interface ControlPanelProps {
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  isPlaying?: boolean;
}

/**
 * Control panel for demo playback
 *
 * Provides basic controls for managing demo state:
 * - Play: Start or resume actor animations
 * - Pause: Pause actor animations
 * - Reset: Reset demo to initial state
 */
export function ControlPanel({
  onPlay,
  onPause,
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
        onClick={onPause}
        disabled={!isPlaying}
        style={{
          padding: '0.5rem 1rem',
          cursor: !isPlaying ? 'not-allowed' : 'pointer',
          opacity: !isPlaying ? 0.5 : 1,
        }}
      >
        Pause
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
        {isPlaying ? 'Playing' : 'Paused'}
      </span>
    </div>
  );
}
