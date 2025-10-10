import { Rect, Text } from 'react-konva';

interface ButtonProps {
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  borderColor: string;
  text: string;
  fontFamily?: string;
  onClick: () => void;
}

export function Button({
  x,
  y,
  width,
  height,
  bgColor,
  borderColor,
  textColor,
  text,
  fontFamily,
  onClick,
}: ButtonProps) {
  return (
    <>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="lightblue"
        stroke={borderColor}
        strokeWidth={5}
        backgroundColor={bgColor}
        cornerRadius={10}
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
      <Text
        listening={false}
        x={x}
        y={y}
        text={text}
        fontSize={36}
        fontFamily={fontFamily}
        fill={textColor}
        align="center"
        width={width}
        height={height}
        verticalAlign="middle"
      />
    </>
  );
}
