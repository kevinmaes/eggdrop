import { useSelector } from '@xstate/react';
import { Group, Rect, Text, Image } from 'react-konva';
import useImage from 'use-image';
import { AppActorContext } from '../app.machine';
import { ActorRefFrom } from 'xstate';
import { gameLevelMachine } from '../GameLevel/gameLevel.machine';

export function LevelScoreBox() {
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
			eggFrames: state.context.gameAssets.egg.sprite.frames,
			levelScore: state.context.levelScore,
		};
	});

	if (!gameConfig) {
		return null;
	}

	return (
		<Group x={gameConfig.stageDimensions.width - 210} y={120}>
			{/* Background box */}
			<Rect
				width={200}
				height={150}
				x={0}
				y={0}
				opacity={0.6}
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

export function EggTally({
	eggColor,
	eggSize = 30,
	count,
	x,
	y,
	width,
	height,
}: {
	eggColor: 'white' | 'gold';
	eggSize?: number;
	count: number;
	x: number;
	y: number;
	width?: number;
	height?: number;
}) {
	const eggFrames = AppActorContext.useSelector((state) => {
		return state?.context?.gameAssets?.egg?.sprite?.frames ?? {};
	});
	const [eggImage] = useImage(`../images/egg.sprite.png`);

	if (!eggFrames) {
		return null;
	}

	const eggFrame = eggFrames[`egg-${eggColor}.png`].frame;

	return (
		<Group x={x} y={y} width={width} height={height}>
			<Image
				image={eggImage}
				width={eggSize}
				height={eggSize}
				border="5px solid red"
				shadowColor="black"
				shadowBlur={10}
				shadowOffset={{ x: 3, y: 3 }}
				shadowOpacity={0.5}
				crop={{
					x: eggFrame.x,
					y: eggFrame.y,
					width: eggFrame.w,
					height: eggFrame.h,
				}}
			/>
			<Text
				x={50}
				y={10}
				text={count.toLocaleString()}
				fontSize={20}
				fontStyle="bold"
				fontFamily="Arial"
				fill="black"
			/>
		</Group>
	);
}
