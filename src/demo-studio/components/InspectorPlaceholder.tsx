import { PRESENTATION_LAYOUT } from '../demo-constants';

import type { LayoutMode } from '../demo-constants';

interface InspectorPlaceholderProps {
  layoutMode: LayoutMode;
}

export function InspectorPlaceholder({
  layoutMode,
}: InspectorPlaceholderProps) {
  const dimensions = getInspectorDimensions(layoutMode);
  const isVertical = layoutMode.startsWith('vertical');
  const percentage =
    layoutMode === 'horizontal-split-narrow'
      ? '80% width'
      : isVertical
        ? '90% height'
        : '75% width';

  return (
    <div
      style={{
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: '#1a1a1a',
        border: '2px dashed #4a4a4a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '1rem',
      }}
    >
      <div
        style={{
          fontSize: '1.5rem',
          color: '#9a9a9a',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Stately Inspector Zone
      </div>
      <div
        style={{
          fontSize: '1rem',
          color: '#6a6a6a',
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        Inspector opens in separate window. Position it here for recording or
        overlay inspector video in this space during editing.
      </div>
      <div
        style={{
          fontSize: '0.875rem',
          color: '#5a5a5a',
          fontFamily: 'monospace',
          marginTop: '1rem',
        }}
      >
        {dimensions.width}×{dimensions.height}px ({percentage})
      </div>
    </div>
  );
}

function getInspectorDimensions(layoutMode: LayoutMode) {
  switch (layoutMode) {
    case 'horizontal-split':
      return PRESENTATION_LAYOUT.horizontalSplit.inspector;
    case 'horizontal-split-narrow':
      return PRESENTATION_LAYOUT.horizontalSplitNarrow.inspector;
    case 'vertical-split-top':
      return PRESENTATION_LAYOUT.verticalSplitTop.inspector;
    case 'vertical-split-bottom':
      return PRESENTATION_LAYOUT.verticalSplitBottom.inspector;
  }
}
