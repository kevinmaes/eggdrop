import { Rect, Text } from 'react-konva';

interface KonvaButtonProps {
	x: number;
	y: number;
	width: number;
	height: number;
	text: string;
	onClick: () => void;
}

export function Button({
	x,
	y,
	width,
	height,
	text,
	onClick,
}: KonvaButtonProps) {
	return (
		<>
			<Rect
				x={x}
				y={y}
				width={width}
				height={height}
				fill="lightblue"
				shadowBlur={5}
				stroke="white"
				strokeWidth={5}
				backgroundColor="#a5c4fa"
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
				fontFamily="Arial"
				fill="#455579"
				align="center"
				width={width}
				height={height}
				verticalAlign="middle"
			/>
		</>
	);
}
