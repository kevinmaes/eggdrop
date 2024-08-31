import { useSelector } from '@xstate/react';
import { Group, Rect, Text } from 'react-konva';
import { AppActorContext } from '../app.machine';
import { ActorRefFrom } from 'xstate';
import { gameLevelMachine } from '../GameLevel/gameLevel.machine';
import { EggTally } from '../EggTally/EggTally';

export function LevelScoreBox({
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
	const gameScoreData = AppActorContext.useSelector(
		(state) => state.context.gameScoreData
	);
	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;

	const { gameConfig, scoreData } = useSelector(gameLevelActorRef, (state) => {
		if (!state) {
			return {};
		}
		return {
			gameConfig: state.context?.gameConfig,
			scoreData: state.context.scoreData,
		};
	});

	const anticipatedGameScore =
		gameScoreData.gameScore + (scoreData?.levelScore ?? 0);

	if (!gameConfig) {
		return null;
	}

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
				strokeWidth={4}
				cornerRadius={10}
			/>
			{/* Level Score */}
			<Group x={10} y={15}>
				<Text
					x={0}
					y={0}
					text="Score:"
					fontSize={24}
					fontFamily="Arco"
					height={24}
					verticalAlign="bottom"
					fill={gameConfig.colors.secondaryOrange}
				/>
				<Text
					x={95}
					y={0}
					text={`${scoreData.levelScore.toLocaleString()}`}
					fontSize={32}
					fontFamily="Arco"
					fill={gameConfig.colors.secondaryOrange}
					align="right"
					height={24}
					verticalAlign="bottom"
					width={80}
				/>
			</Group>
			{/* Game Score */}
			<Group x={10} y={50}>
				<Text
					x={0}
					y={0}
					verticalAlign="bottom"
					height={24}
					text="Total Score:"
					fontSize={16}
					fontFamily="Arco"
					fill={gameConfig.colors.secondaryBlue}
				/>
				<Text
					x={95}
					y={0}
					text={`${anticipatedGameScore.toLocaleString()}`}
					fontSize={16}
					fontFamily="Arco"
					fill={gameConfig.colors.secondaryBlue}
					align="right"
					height={24}
					verticalAlign="bottom"
					width={80}
				/>
			</Group>
			{/* Egg Tally for white, gold, black eggs */}
			<Group x={10} y={95}>
				<EggTally
					eggColor="white"
					count={scoreData.eggsCaught.white}
					x={0}
					y={0}
				/>
				<EggTally
					eggColor="gold"
					count={scoreData.eggsCaught.gold}
					x={60}
					y={0}
				/>
				<EggTally
					eggColor="black"
					count={scoreData.eggsCaught.black}
					x={120}
					y={0}
				/>
			</Group>
		</Group>
	);
}
