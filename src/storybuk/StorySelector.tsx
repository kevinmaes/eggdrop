import { Network } from 'lucide-react';

import type { StoryConfigs } from './types';

interface StorySelectorProps {
  storyConfigs: StoryConfigs;
  currentStoryId: string | null;
  onSelect: (demoId: string) => void;
}

/**
 * Dropdown selector for choosing which story to display
 *
 * Lists all available stories from the story configs and allows
 * the user to switch between them.
 */
export function StorySelector({
  storyConfigs,
  currentStoryId,
  onSelect,
}: StorySelectorProps) {
  const demoIds = Object.keys(storyConfigs);

  if (demoIds.length === 0) {
    return (
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
        }}
      >
        No stories available. Add story configurations to story-configs.ts
      </div>
    );
  }

  const currentConfig = currentStoryId ? storyConfigs[currentStoryId] : null;
  const hasInspector = currentConfig?.inspector?.visible === true;

  return (
    <div
      style={{
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#ffffff',
      }}
    >
      <label htmlFor="demo-select" style={{ fontWeight: 'bold' }}>
        Select Demo:
      </label>
      <select
        id="demo-select"
        value={currentStoryId || ''}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          padding: '0.5rem',
          fontSize: '1rem',
          minWidth: '200px',
        }}
      >
        <option value="">-- Choose a story --</option>
        {demoIds.map((demoId) => {
          const config = storyConfigs[demoId];
          const hasInspector = config?.inspector?.visible === true;
          return (
            <option key={demoId} value={demoId}>
              {config?.title}
              {hasInspector ? ' ◆' : ''}
            </option>
          );
        })}
      </select>
      {currentStoryId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {hasInspector && (
            <Network size={16} style={{ color: '#4CAF50', flexShrink: 0 }} />
          )}
          <span style={{ color: '#666', fontSize: '0.875rem' }}>
            {currentConfig?.description}
          </span>
        </div>
      )}
    </div>
  );
}
