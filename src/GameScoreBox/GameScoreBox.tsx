import { Group, Rect, Text } from 'react-konva';
import { EggTally } from '../LevelScoreBox/LevelScoreBox';

export function GameScoreBox({
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
	return (
		<Group x={x} y={y}>
			{/* Background box */}
			<Rect
				width={width}
				height={height}
				x={0}
				y={0}
				opacity={0.5}
				fill="white"
				cornerRadius={10}
			/>
			{/* Game Score */}
			<Group x={40} y={20} width={width}>
				<Text
					x={0}
					y={15}
					// width={width}
					align="center"
					text="Total Score"
					fontSize={20}
					fontFamily="Arial"
					fill="black"
				/>
				<Text
					x={120}
					y={5}
					// width={width}
					align="center"
					text={`${1000}`}
					fontSize={40}
					fontFamily="Arial"
					fill="black"
				/>
			</Group>
			<Group x={0.5 * width - 75} y={90} width={width}>
				<EggTally eggColor="white" count={10} x={0} y={0} width={100} />
				<EggTally eggColor="gold" count={5} x={100} y={0} width={100} />
			</Group>
		</Group>
	);
}
