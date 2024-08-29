import { useSelector } from '@xstate/react';
import { Group, Rect, Text } from 'react-konva';
import { ActorRefFrom } from 'xstate';
import { gameLevelMachine } from '../GameLevel/gameLevel.machine';
import { AppActorContext } from '../app.machine';

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
	const appActorRef = AppActorContext.useActorRef();
	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;
	const { totalLevelMS, remainingMS } = useSelector(
		gameLevelActorRef,
		(state) => {
			return {
				totalLevelMS: state.context.gameConfig.levelDurationMS,
				remainingMS: state.context.remainingMS,
			};
		}
	);

	const minutes = Math.floor(remainingMS / 60000);
	const seconds = Math.floor((remainingMS % 60000) / 1000);

	const barInsetWidth = 5;
	const remainingPercentage = remainingMS / totalLevelMS;
	const barWithTotal = width - 2 * barInsetWidth;
	const remainingTimeBarWidth = barWithTotal * remainingPercentage;

	const remainingTimeString =
		minutes > 0
			? `${minutes} m ${seconds.toString().padStart(2, '0')} s`
			: `${seconds.toString().padStart(2, '0')} s`;

	return (
		<Group x={x} y={y}>
			<Rect
				x={0}
				y={0}
				width={width}
				height={height}
				fill="transparent"
				stroke="white"
				strokeWidth={2}
				cornerRadius={8}
			/>
			{/* Timer text */}
			<Text
				y={10}
				text={remainingTimeString}
				fontSize={20}
				fontStyle="bold"
				width={0.9 * width}
				align="right"
				fill="white"
			/>
			{/* Progress bar */}
			<Rect
				x={5}
				y={35}
				width={remainingTimeBarWidth}
				height={10}
				fill="white"
				opacity={0.5}
				cornerRadius={[
					0,
					0,
					remainingTimeBarWidth > barWithTotal - barInsetWidth ? 5 : 0,
					5,
				]}
			/>
		</Group>
	);
}
