import { useRef } from 'react';
import { Layer, Text } from 'react-konva';
import { Hen } from '../Hen/Hen';
import { Chef } from '../Chef/Chef';
import Konva from 'konva';
import { gameLevelMachine } from './gameLevel.machine';
import { Egg } from '../Egg/Egg';
import { ActorRefFrom } from 'xstate';
import { useSelector } from '@xstate/react';
import { LevelScoreBox } from '../LevelScoreBox/LevelScoreBox';
import { AppActorContext } from '../app.machine';
import { CountdownTimer } from '../CountdownTimer/CountdownTimer';

export function GameLevel() {
	const appActorRef = AppActorContext.useActorRef();
	const { gameConfig, generationIndex } = AppActorContext.useSelector(
		(state) => ({
			gameConfig: state.context.gameConfig,
			generationIndex: state.context.generationIndex,
		})
	);
	const isPlaying = AppActorContext.useSelector((state) =>
		state.hasTag('actively playing')
	);
	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;

	const { remainingMS, henActorRefs, eggActorRefs } = useSelector(
		gameLevelActorRef,
		(state) => {
			if (!state) {
				console.log('GameLevel: state is null');
				return {
					remainingMS: 0,
					henActorRefs: [],
					eggActorRefs: [],
				};
			}
			return {
				remainingMS: state.context.remainingMS,
				henActorRefs: state.context.henActorRefs,
				eggActorRefs: state.context.eggActorRefs,
			};
		}
	);

	const layerRef = useRef<Konva.Layer>(null);

	if (!isPlaying) {
		return null;
	}

	return (
		<>
			{/* Hen layer */}
			<Layer ref={layerRef}>
				{henActorRefs.map((henActorRef) => (
					<Hen key={henActorRef.id} henActorRef={henActorRef} />
				))}
			</Layer>

			{/* Chef and Egg layers (they interact) */}
			<Layer>
				<Chef layerRef={layerRef} />
				{eggActorRefs.map((eggActorRef) => (
					<Egg key={eggActorRef.id} eggActorRef={eggActorRef} />
				))}
			</Layer>

			{/* Game UI: Level Score, Timer */}
			<Layer>
				<Text
					x={100}
					y={250}
					text={`Level: ${generationIndex + 1}`}
					fontSize={20}
					fontFamily="Arial"
					fill="white"
				/>
				<Text
					x={200}
					y={250}
					text={`Time: ${remainingMS / 1000} seconds`}
					fontSize={20}
					fontFamily="Arial"
					fill="white"
				/>
				<CountdownTimer
					x={70}
					y={gameConfig.henBeam.y + gameConfig.henBeam.height + 10}
					width={gameConfig.countdownTimer.width}
					height={gameConfig.countdownTimer.height}
				/>
				<LevelScoreBox
					x={gameConfig.stageDimensions.width - 210}
					y={gameConfig.henBeam.y + gameConfig.henBeam.height + 10}
					width={200}
					height={150}
				/>
			</Layer>
		</>
	);
}
