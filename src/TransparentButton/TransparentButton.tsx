import { Rect } from 'react-konva';

interface TransparentButtonProps {
  x: number;
  y: number;
  width: number;
  height: number;
  onClick: () => void;
}

export function TransparentButton({
  x,
  y,
  width,
  height,
  onClick,
}: TransparentButtonProps) {
  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="transparent"
      onClick={onClick} // Handle button clicks
      onMouseEnter={(e) => {
        // Change cursor to pointer on hover
        const container = e.target.getStage()?.container();
        if (container) {
          container.style.cursor = 'pointer';
        }
      }}
      onMouseLeave={(e) => {
        // Change cursor back to default when not hovering
        const container = e.target.getStage()?.container();
        if (container) {
          container.style.cursor = 'default';
        }
      }}
    />
  );
}
