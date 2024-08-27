import { Group, Rect, Text, Image } from 'react-konva';
import useImage from 'use-image';
import { AppActorContext } from '../app.machine';

export function GameScoreBox() {
	const { gameConfig, eggFrames } = AppActorContext.useSelector((state) => ({
		gameConfig: state.context.gameConfig,
		eggFrames: state.context.gameAssets?.egg.sprite.frames ?? {},
		generationIndex: state.context.generationIndex,
	}));
	const [eggImage] = useImage(`../images/egg.sprite.png`);
	const whiteEggFrame = eggFrames['egg-white.png'].frame;
	const goldEggFrame = eggFrames['egg-gold.png'].frame;

	return (
		<Group x={gameConfig.stageDimensions.midX - 200} y={275}>
			<Rect
				width={400}
				height={150}
				x={0}
				y={0}
				opacity={0.5}
				fill="white"
				cornerRadius={10}
			/>
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
