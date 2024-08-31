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

	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;

	const { henActorRefs, eggActorRefs } = useSelector(
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
				{/* Level number */}
				<Text
					x={gameConfig.stageDimensions.margin}
					y={gameConfig.henBeam.y + 5}
					text={`LEVEL ${generationIndex + 1}`}
					fontSize={18}
					fontStyle="bold"
					fontFamily="Arco"
					fill={gameConfig.colors.primaryOrange}
					opacity={0.75}
				/>
				<CountdownTimer
					x={70}
					y={gameConfig.henBeam.y + gameConfig.henBeam.height + 10}
					width={gameConfig.countdownTimer.width}
					height={gameConfig.countdownTimer.height}
				/>
				<LevelScoreBox
					x={
						gameConfig.stageDimensions.width -
						120 -
						gameConfig.stageDimensions.margin
					}
					y={gameConfig.henBeam.y + gameConfig.henBeam.height + 10}
					width={120}
					height={320}
				/>
			</Layer>
		</>
	);
}
