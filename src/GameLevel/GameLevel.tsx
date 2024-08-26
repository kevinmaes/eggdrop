import { useRef } from 'react';
import { Group, Layer, Rect, Text } from 'react-konva';
import { Hen } from '../Hen/Hen';
import { Chef } from '../Chef/Chef';
import Konva from 'konva';
import { gameLevelMachine } from './gameLevel.machine';
import { Egg } from '../Egg/Egg';
import { ActorRefFrom } from 'xstate';
import { useSelector } from '@xstate/react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

interface GameLevelProps {
	stageDimensions: {
		width: number;
		height: number;
	};
	gameLevelActorRef: ActorRefFrom<typeof gameLevelMachine>;
}

export function GameLevel({
	// stageDimensions,
	gameLevelActorRef,
}: GameLevelProps) {
	const {
		gameConfig,
		eggFrames,
		levelScore,
		generationIndex,
		remainingTime,
		henActorRefs,
		eggActorRefs,
	} = useSelector(gameLevelActorRef, (state) => ({
		gameConfig: state.context.gameConfig,
		eggFrames: state.context.gameAssets.egg.sprite.frames,
		levelScore: state.context.levelScore,
		generationIndex: state.context.generationIndex,
		remainingTime: state.context.remainingTime,
		henActorRefs: state.context.henActorRefs,
		eggActorRefs: state.context.eggActorRefs,
	}));

	const layerRef = useRef<Konva.Layer>(null);
	const [eggImage] = useImage(`../images/egg.sprite.png`);
	const whiteEggFrame = eggFrames['egg-white.png'].frame;
	const goldEggFrame = eggFrames['egg-gold.png'].frame;

	return (
		<>
			<Layer ref={layerRef}>
				{henActorRefs.map((henActorRef) => (
					<Hen key={henActorRef.id} henActorRef={henActorRef} />
				))}
			</Layer>
			<Layer>
				<Chef layerRef={layerRef} />
			</Layer>
			<Layer>
				{eggActorRefs.map((eggActorRef) => (
					<Egg key={eggActorRef.id} eggActorRef={eggActorRef} />
				))}
			</Layer>
			{/* Game Timer UI layer */}
			<Layer>
				<Text
					x={100}
					y={250}
					text={`Gen: ${generationIndex}`}
					fontSize={20}
					fontFamily="Arial"
					fill="black"
				/>
				<Text
					x={200}
					y={250}
					text={`Time: ${remainingTime / 1000} seconds`}
					fontSize={20}
					fontFamily="Arial"
					fill="black"
				/>

				{/* Score Box */}
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
							<KonvaImage
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
							<KonvaImage
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
			</Layer>
		</>
	);
}
