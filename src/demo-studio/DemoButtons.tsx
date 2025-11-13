import { useState } from 'react';

import type { DemoConfig } from './types';

/**
 * Demo Buttons Component
 *
 * Horizontal list of buttons for selecting demos.
 * Each button shows a short name and has a tooltip with full description.
 */

interface DemoButtonsProps {
  demos: DemoConfig[];
  selectedDemoId: string | null;
  onSelectDemo: (demoId: string) => void;
}

function DemoButton({
  demo,
  isSelected,
  onClick,
}: {
  demo: DemoConfig;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Get concise button label focusing on what makes each demo unique
  const getShortName = () => {
    const shortNameMap: Record<string, string> = {
      'Hen - Idle': 'Idle',
      'Hen - Back and Forth': 'Back and Forth',
      'Hen - With Pauses': 'With Pauses',
      'Egg - Falling': 'Falling',
      'Egg - Falling + Rotating': '+Rotating',
      'Egg - Splat': '+Splat',
      'Egg - Falling and Landing': '+Landing',
      'Egg - Land and Hatch': '+Hatch',
      'Hatched Chick - Exit': 'Chick Exit',
      'Egg - Hatching with Jump (Inserted Animation)': '+Jump',
      'Egg - Complete Hatching (Game-Accurate)': 'Complete',
    };

    return shortNameMap[demo.title] || demo.title;
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          padding: '8px 16px',
          border: isSelected ? '2px solid #2196F3' : '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: isSelected ? '#E3F2FD' : '#fff',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: isSelected ? '600' : 'normal',
          color: isSelected ? '#1565C0' : '#333',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s',
          boxShadow: isSelected ? '0 2px 6px rgba(33, 150, 243, 0.3)' : 'none',
          minWidth: '80px',
        }}
        onMouseDown={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = '#BBDEFB';
          }
        }}
        onMouseUp={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = '#fff';
          }
        }}
      >
        {getShortName()}
      </button>

      {/* Tooltip */}
      {showTooltip && demo.description && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: '#333',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'normal',
            maxWidth: '500px',
            minWidth: '250px',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
            {demo.title}
          </div>
          <div>{demo.description}</div>
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid #333',
            }}
          />
        </div>
      )}
    </div>
  );
}

export function DemoButtons({
  demos,
  selectedDemoId,
  onSelectDemo,
}: DemoButtonsProps) {
  if (demos.length === 0) {
    return (
      <div
        style={{
          padding: '12px 16px',
          color: '#999',
          fontStyle: 'italic',
          fontSize: '13px',
        }}
      >
        No demos available for this character
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {demos.map((demo) => (
        <DemoButton
          key={demo.id}
          demo={demo}
          isSelected={selectedDemoId === demo.id}
          onClick={() => onSelectDemo(demo.id)}
        />
      ))}
    </div>
  );
}
