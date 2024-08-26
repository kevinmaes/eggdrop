import { useRef } from 'react';
import { Layer, Text } from 'react-konva';
import { Hen } from '../Hen/Hen';
import { Chef } from '../Chef/Chef';
import Konva from 'konva';
import { gameLevelMachine } from './gameLevel.machine';
import { Egg } from '../Egg/Egg';
import { ActorRefFrom } from 'xstate';
import { useSelector } from '@xstate/react';
import { ScoreBox } from '../ScoreBox/ScoreBox';

interface GameLevelProps {
	stageDimensions: {
		width: number;
		height: number;
	};
	gameLevelActorRef: ActorRefFrom<typeof gameLevelMachine>;
}

export function GameLevel({ gameLevelActorRef }: GameLevelProps) {
	const { generationIndex, remainingTime, henActorRefs, eggActorRefs } =
		useSelector(gameLevelActorRef, (state) => ({
			generationIndex: state.context.generationIndex,
			remainingTime: state.context.remainingTime,
			henActorRefs: state.context.henActorRefs,
			eggActorRefs: state.context.eggActorRefs,
		}));

	const layerRef = useRef<Konva.Layer>(null);

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
				<ScoreBox />
			</Layer>
		</>
	);
}
