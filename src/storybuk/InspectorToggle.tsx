/**
 * Inspector Toggle Component
 *
 * Provides a checkbox to enable/disable the Stately Inspector.
 * When disabled, headless actors are not loaded, improving performance
 * for quick story browsing.
 */

function InspectorToggle({
  inspectorEnabled,
  onToggle,
}: {
  inspectorEnabled: boolean;
  onToggle: () => void;
}) {
  const handleToggle = () => {
    onToggle();
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: '#2c2c2c',
        borderRadius: '4px',
        border: '1px solid #444',
      }}
    >
      <label
        htmlFor="inspector-toggle"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#e0e0e0',
          userSelect: 'none',
        }}
      >
        <input
          id="inspector-toggle"
          type="checkbox"
          checked={inspectorEnabled}
          onChange={handleToggle}
          style={{
            cursor: 'pointer',
            width: '16px',
            height: '16px',
          }}
        />
        <span>Show Inspector</span>
      </label>
    </div>
  );
}

export default InspectorToggle;
