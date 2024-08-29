import { useRef } from 'react';
import { Layer, Text } from 'react-konva';
import { Hen } from '../Hen/Hen';
import { Chef } from '../Chef/Chef';
import Konva from 'konva';
import { gameLevelMachine } from './gameLevel.machine';
import { Egg } from '../Egg/Egg';
import { ActorRefFrom } from 'xstate';
import { useSelector } from '@xstate/react';
import { AppActorContext } from '../app.machine';

export function GameLevel() {
	const appActorRef = AppActorContext.useActorRef();
	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;

	const {
		levelScore,
		generationIndex,
		remainingTime,
		henActorRefs,
		eggActorRefs,
	} = useSelector(gameLevelActorRef, (state) => {
		if (!state) {
			return {
				levelScore: 0,
				generationIndex: 0,
				remainingTime: 0,
				henActorRefs: [],
				eggActorRefs: [],
			};
		}
		return {
			levelScore: state?.context?.levelScore ?? 0,
			generationIndex: state.context.generationIndex,
			remainingTime: state.context.remainingTime,
			henActorRefs: state.context.henActorRefs,
			eggActorRefs: state.context.eggActorRefs,
		};
	});

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
				<Text
					x={10}
					y={300}
					text={`Score: ${levelScore}`}
					fontSize={30}
					fontFamily="Arial"
					fill="black"
				/>
			</Layer>
		</>
	);
}
