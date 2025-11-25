import { Palette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const COLOR_SWATCHES = [
  { name: 'Dark', color: '#1f2644' },
  { name: 'Medium', color: '#394b7e' },
  { name: 'Light', color: '#719ed5' },
];

/**
 * Color picker component for selecting canvas background color
 *
 * Provides quick-select swatches and a custom color picker
 */
export function ColorPicker({ color, onChange }: ColorPickerProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.5rem',
        border: '1px solid #e8e8e8',
        borderRadius: '4px',
        backgroundColor: '#ffffff',
      }}
    >
      <Palette size={16} style={{ color: '#666' }} />

      {/* Color swatches */}
      {COLOR_SWATCHES.map((swatch) => (
        <button
          key={swatch.color}
          onClick={() => onChange(swatch.color)}
          title={`${swatch.name} - ${swatch.color}`}
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: swatch.color,
            border:
              color === swatch.color
                ? '2px solid #2196F3'
                : '1px solid #d0d0d0',
            borderRadius: '3px',
            cursor: 'pointer',
            padding: 0,
            transition: 'border 0.2s',
          }}
        />
      ))}

      {/* Custom color picker - styled as swatch with gradient indicator */}
      <div style={{ position: 'relative' }}>
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          title="Custom color picker"
          style={{
            width: '24px',
            height: '24px',
            border: '1px solid #d0d0d0',
            borderRadius: '3px',
            cursor: 'pointer',
            padding: 0,
            background: `linear-gradient(135deg,
              #ff0000 0%, #ff7f00 16.67%, #ffff00 33.33%,
              #00ff00 50%, #0000ff 66.67%, #8b00ff 83.33%, #ff0000 100%)`,
          }}
        />
      </div>
    </div>
  );
}
