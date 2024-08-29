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
			<Group x={10} y={50}>
				<Text
					x={0}
					y={5}
					text="Total Score:"
					fontSize={20}
					fontFamily="Arial"
					fill="black"
				/>
				<Text
					x={120}
					y={0}
					text={`${1000}`}
					fontSize={30}
					fontFamily="Arial"
					fill="black"
				/>
			</Group>
			<Group y={100}>
				<EggTally eggColor="white" count={10} x={10} y={0} />
				<EggTally eggColor="gold" count={5} x={100} y={0} />
			</Group>
		</Group>
	);
}
