interface StatelyEmbedProps {
  width: number;
  height: number;
  demoTitle?: string;
  statelyUrl?: string;
}

/**
 * Embeds a Stately statechart visualization in an iframe
 *
 * Displays an embedded Stately editor view showing the state chart.
 * The URL should be from stately.ai/registry/editor/...
 */
export function StatelyEmbed({
  width,
  height,
  demoTitle,
  statelyUrl,
}: StatelyEmbedProps) {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#1a1a1a',
        border: '2px solid #4a4a4a',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {demoTitle && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '16px',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '4px 8px',
            borderRadius: '4px',
            zIndex: 10,
            userSelect: 'none',
          }}
        >
          {demoTitle}
        </div>
      )}
      {statelyUrl ? (
        <iframe
          src={statelyUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Stately Statechart"
        />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6a6a6a',
            fontSize: '1rem',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          No Stately embed URL configured for this demo
        </div>
      )}
    </div>
  );
}
