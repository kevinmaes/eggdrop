/**
 * Inspector Toggle Component
 *
 * Provides a button to launch/close the Stately Inspector window.
 * When launched, headless actors are created and the inspector window opens.
 * When closed, headless actors are destroyed and the inspector window closes.
 */

export function InspectorToggle({
  inspectorEnabled,
  onToggle,
}: {
  inspectorEnabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '8px 16px',
        backgroundColor: inspectorEnabled ? '#F44336' : '#2196F3',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = inspectorEnabled
          ? '#D32F2F'
          : '#1976D2';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = inspectorEnabled
          ? '#F44336'
          : '#2196F3';
      }}
    >
      {inspectorEnabled ? 'Close Inspector' : 'Launch Inspector'}
    </button>
  );
}
