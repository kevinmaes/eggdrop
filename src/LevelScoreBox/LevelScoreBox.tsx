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
	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;

	const { gameConfig, levelScore } = useSelector(gameLevelActorRef, (state) => {
		if (!state) {
			return {};
		}
		return {
			gameConfig: state.context?.gameConfig,
			eggFrames: state.context.gameAssets.egg.frames,
			levelScore: state.context.scoreData.levelScore,
		};
	});

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
			<Group x={20} y={10}>
				<Text
					x={0}
					y={5}
					text="Level Score:"
					fontSize={20}
					fontFamily="Arial"
					fill="black"
				/>
				<Text
					x={120}
					y={0}
					text={`${levelScore}`}
					fontSize={30}
					fontFamily="Arial"
					fill="black"
				/>
			</Group>
			{/* Game Score */}
			<Group x={20} y={50}>
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
					text={`${levelScore}`}
					fontSize={30}
					fontFamily="Arial"
					fill="black"
				/>
			</Group>
			{/* Egg Tally */}
			<EggTally eggColor="white" count={10} x={30} y={90} />
			<EggTally eggColor="gold" count={5} x={110} y={90} />
		</Group>
	);
}
