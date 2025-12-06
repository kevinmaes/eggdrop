import { useState, useEffect } from 'react';

interface StatelyEmbedProps {
  width: number;
  height: number;
  demoTitle?: string;
  statelyUrl?: string;
  theme?: 'light' | 'dark';
}

/**
 * Embeds a Stately statechart visualization in an iframe
 *
 * Displays an embedded Stately editor view showing the state chart.
 * The URL should be from stately.ai/registry/editor/...
 * The theme parameter controls the color mode of the embed.
 */
export function StatelyEmbed({
  width,
  height,
  demoTitle,
  statelyUrl,
  theme = 'light',
}: StatelyEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);

  // Append colorMode parameter to statelyUrl if URL exists
  const urlWithTheme = statelyUrl
    ? `${statelyUrl}${statelyUrl.includes('?') ? '&' : '?'}colorMode=${theme}`
    : undefined;

  // Dynamic colors based on theme
  // Use #f6f7f7 for light mode to match Stately's default background
  const backgroundColor = theme === 'light' ? '#f6f7f7' : '#1a1a1a';
  const borderColor = theme === 'light' ? '#e0e0e0' : '#4a4a4a';

  // Reset loading state when URL changes
  useEffect(() => {
    setIsLoading(true);
    setShowOverlay(true);
  }, [urlWithTheme]);

  // Handle iframe load with delay and fade-out
  const handleIframeLoad = () => {
    // Wait a bit to ensure content is fully rendered
    setTimeout(() => {
      setIsLoading(false);
      // Start fade-out animation
      setTimeout(() => {
        setShowOverlay(false);
      }, 300); // Duration of fade-out animation
    }, 500); // Delay before starting fade
  };

  return (
    <div
      style={{
        width,
        height,
        backgroundColor,
        border: `2px solid ${borderColor}`,
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
      {/* Temporary debug overlay for URL */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.95)',
          fontFamily: 'monospace',
          backgroundColor: 'rgba(255, 0, 0, 0.8)',
          padding: '6px 10px',
          borderRadius: '4px',
          zIndex: 10,
          maxWidth: '90%',
          wordBreak: 'break-all',
          lineHeight: '1.4',
        }}
      >
        <strong>DEBUG URL:</strong>
        <br />
        {urlWithTheme || 'No URL'}
      </div>
      {urlWithTheme ? (
        <>
          <iframe
            key={`stately-embed-${theme}`}
            src={urlWithTheme}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Stately Statechart"
            onLoad={handleIframeLoad}
          />
          {showOverlay && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme === 'light' ? '#666' : '#999',
                fontSize: '14px',
                opacity: isLoading ? 1 : 0,
                transition: 'opacity 300ms ease-out',
                pointerEvents: isLoading ? 'auto' : 'none',
              }}
            >
              Loading...
            </div>
          )}
        </>
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
