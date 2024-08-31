import { Group, Rect, Text } from 'react-konva';
import { Button } from '../Button/Button';
import { AppActorContext } from '../app.machine';
import { EggTally } from '../EggTally/EggTally';

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
	const appActorRef = AppActorContext.useActorRef();
	const { gameConfig, gameScoreData } = AppActorContext.useSelector(
		(state) => ({
			gameConfig: state.context.gameConfig,
			gameScoreData: state.context.gameScoreData,
		})
	);

	return (
		<Group x={x} y={y}>
			{/* Background box */}
			<Rect
				width={width}
				height={height}
				x={0}
				y={0}
				opacity={0.75}
				fill="white"
				stroke="#a5c4fa"
				strokeWidth={5}
				cornerRadius={10}
				shadowBlur={5}
			/>
			{/* Game Score */}
			<Group x={40} y={20} width={width}>
				<Text
					x={0}
					y={15}
					align="center"
					text="Total Score"
					fontSize={20}
					fontFamily="Arial"
					fill="black"
				/>
				<Text
					x={120}
					y={5}
					align="center"
					text={`${gameScoreData.gameScore.toLocaleString()}`}
					fontSize={40}
					fontFamily="Arial"
					fill="black"
				/>
			</Group>
			<Group x={20} y={90} width={width}>
				<EggTally
					eggColor="white"
					count={gameScoreData.eggsCaught.white}
					x={0}
					y={0}
					width={100}
					eggSize={40}
				/>
				<EggTally
					eggColor="gold"
					count={gameScoreData.eggsCaught.gold}
					x={85}
					y={0}
					width={100}
					eggSize={40}
				/>
				<EggTally
					eggColor="black"
					count={gameScoreData.eggsCaught.black}
					x={170}
					y={0}
					width={100}
					eggSize={40}
				/>
			</Group>

			<Button
				x={0.5 * width - 100}
				y={180}
				width={200}
				height={100}
				bgColor={gameConfig.colors.secondaryBlue}
				borderColor="white"
				textColor="white"
				text="Play"
				onClick={() => appActorRef.send({ type: 'Play' })}
			/>
		</Group>
	);
}
