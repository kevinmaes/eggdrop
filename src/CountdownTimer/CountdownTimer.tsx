import { Group, Rect, Text } from 'react-konva';

export function CountdownTimer({
	x,
	y,
	width,
	height,
}: {
	x: number;
	y: number;
	width: number;
	height: number;
}) {
	const timerText = 'Time left: 5m 10s';
	let progressBarWidth = width;

	return (
		<Group x={x} y={y}>
			<Rect
				x={0}
				y={0}
				width={width}
				height={height}
				fill="white"
				stroke="black"
				strokeWidth={2}
			/>
			{/* Timer text */}
			<Text
				x={10}
				y={10}
				text={timerText}
				fontSize={20}
				fontFamily="Calibri"
				fill="black"
			/>
			{/* Progress bar */}
			<Rect
				x={0}
				y={40}
				width={progressBarWidth}
				height={10} // height of the progress bar
				fill="green"
			/>
		</Group>
	);
}
