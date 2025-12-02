import { StatelyEmbed } from './StatelyEmbed';

import type { SplitOrientation } from '../storybuk-theme';

interface StatelyEmbedContainerProps {
  width: number;
  height: number;
  demoTitle?: string;
  urls: string[];
  theme?: 'light' | 'dark';
  splitOrientation: SplitOrientation;
}

/**
 * Container for multiple Stately embed iframes
 *
 * Handles 0-2 Stately embed URLs with dynamic splitting:
 * - 0 URLs: Shows "No Stately embed URL configured" message
 * - 1 URL: Single embed fills entire area (same as current behavior)
 * - 2 URLs: Splits perpendicular to main split orientation
 *   - Horizontal mode (story left): Split Stately area top/bottom
 *   - Vertical mode (story top): Split Stately area left/right
 */
export function StatelyEmbedContainer({
  width,
  height,
  demoTitle,
  urls,
  theme = 'light',
  splitOrientation,
}: StatelyEmbedContainerProps) {
  // Handle empty array
  if (urls.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: theme === 'light' ? '#f6f7f7' : '#1a1a1a',
          border: `2px solid ${theme === 'light' ? '#e0e0e0' : '#4a4a4a'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6a6a6a',
          fontSize: '1rem',
          textAlign: 'center',
          padding: '2rem',
          boxSizing: 'border-box',
        }}
      >
        No Stately embed URL configured for this demo
      </div>
    );
  }

  // Handle single URL - fills entire area
  if (urls.length === 1) {
    return (
      <StatelyEmbed
        width={width}
        height={height}
        demoTitle={demoTitle}
        statelyUrl={urls[0]}
        theme={theme}
      />
    );
  }

  // Handle 2 URLs - split perpendicular to main orientation
  const embedUrls = urls.slice(0, 2); // Ensure max 2 URLs

  // Warn if more than 2 URLs provided
  if (urls.length > 2) {
    console.warn(
      `StatelyEmbedContainer: ${urls.length} URLs provided, but only 2 are supported. Rendering first 2.`
    );
  }

  // Calculate split dimensions perpendicular to main orientation
  let embedWidth: number;
  let embedHeight: number;
  let flexDirection: 'row' | 'column';

  if (splitOrientation === 'horizontal') {
    // Main split is horizontal (story left, Stately right)
    // Split Stately area top/bottom (vertical stacking)
    embedWidth = width;
    embedHeight = height / 2;
    flexDirection = 'column';
  } else {
    // Main split is vertical (story top, Stately bottom)
    // Split Stately area left/right (horizontal stacking)
    embedWidth = width / 2;
    embedHeight = height;
    flexDirection = 'row';
  }

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection,
        boxSizing: 'border-box',
      }}
    >
      {embedUrls.map((url, index) => (
        <StatelyEmbed
          key={`stately-embed-${index}`}
          width={embedWidth}
          height={embedHeight}
          demoTitle={index === 0 ? demoTitle : undefined}
          statelyUrl={url}
          theme={theme}
        />
      ))}
    </div>
  );
}
