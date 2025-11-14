import { Network } from 'lucide-react';

import type { DemoConfigs } from './types';

interface DemoSelectorProps {
  demoConfigs: DemoConfigs;
  currentDemoId: string | null;
  onSelect: (demoId: string) => void;
}

/**
 * Dropdown selector for choosing which demo to display
 *
 * Lists all available demos from the demo configs and allows
 * the user to switch between them.
 */
export function DemoSelector({
  demoConfigs,
  currentDemoId,
  onSelect,
}: DemoSelectorProps) {
  const demoIds = Object.keys(demoConfigs);

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
        No demos available. Add demo configurations to demo-configs.ts
      </div>
    );
  }

  const currentConfig = currentDemoId ? demoConfigs[currentDemoId] : null;
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
        value={currentDemoId || ''}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          padding: '0.5rem',
          fontSize: '1rem',
          minWidth: '200px',
        }}
      >
        <option value="">-- Choose a demo --</option>
        {demoIds.map((demoId) => {
          const config = demoConfigs[demoId];
          const hasInspector = config?.inspector?.visible === true;
          return (
            <option key={demoId} value={demoId}>
              {config?.title}
              {hasInspector ? ' ◆' : ''}
            </option>
          );
        })}
      </select>
      {currentDemoId && (
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
