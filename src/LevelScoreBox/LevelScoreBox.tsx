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

	const { gameConfig, eggFrames, levelScore } = useSelector(
		gameLevelActorRef,
		(state) => {
			if (!state) {
				console.log('state', state);
				return {};
			}
			return {
				gameConfig: state.context?.gameConfig,
				eggFrames: state.context.gameAssets.egg.sprite.frames,
				levelScore: state.context.levelScore,
			};
		}
	);
	const [eggImage] = useImage(`../images/egg.sprite.png`);

	if (!gameConfig) {
		return null;
	}

	const whiteEggFrame = eggFrames['egg-white.png'].frame;
	const goldEggFrame = eggFrames['egg-gold.png'].frame;

	return (
		<Group x={gameConfig.stageDimensions.width - 210} y={120}>
			<Rect
				width={200}
				height={150}
				x={0}
				y={0}
				opacity={0.5}
				fill="white"
				cornerRadius={10}
			/>
			<Group x={10} y={10}>
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
					text={`${levelScore}`}
					fontSize={30}
					fontFamily="Arial"
					fill="black"
				/>
			</Group>

			<Group y={100}>
				<Group x={10}>
					<Image
						image={eggImage}
						width={30}
						height={30}
						border="5px solid red"
						crop={{
							x: whiteEggFrame.x,
							y: whiteEggFrame.y,
							width: whiteEggFrame.w,
							height: whiteEggFrame.h,
						}}
					/>
					<Text
						x={35}
						y={5}
						text={`${12}`}
						fontSize={20}
						fontFamily="Arial"
						fill="black"
					/>
				</Group>
				<Group x={100}>
					<Image
						image={eggImage}
						width={30}
						height={30}
						border="5px solid red"
						crop={{
							x: goldEggFrame.x,
							y: goldEggFrame.y,
							width: goldEggFrame.w,
							height: goldEggFrame.h,
						}}
					/>
					<Text
						x={35}
						y={5}
						text={`${12}`}
						fontSize={20}
						fontFamily="Arial"
						fill="black"
					/>
				</Group>
			</Group>
		</Group>
	);
}
