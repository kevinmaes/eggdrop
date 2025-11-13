import { PRESENTATION_LAYOUT } from '../demo-constants';

import type { LayoutMode } from '../demo-constants';

interface StatelyEmbedProps {
  layoutMode: LayoutMode;
  demoTitle?: string;
  statelyUrl: string;
}

/**
 * Embeds a Stately statechart visualization in an iframe
 *
 * Replaces the InspectorPlaceholder with an embedded Stately editor view.
 * The URL should be from stately.ai/registry/editor/...
 */
export function StatelyEmbed({
  layoutMode,
  demoTitle,
  statelyUrl,
}: StatelyEmbedProps) {
  const dimensions = getInspectorDimensions(layoutMode);

  return (
    <div
      style={{
        width: dimensions.width,
        height: dimensions.height,
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
      <iframe
        src={statelyUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Stately Statechart"
      />
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
