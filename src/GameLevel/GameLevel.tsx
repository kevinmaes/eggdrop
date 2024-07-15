import { useRef } from 'react';
import { Layer, Text } from 'react-konva';
import { Hen } from '../Hen/Hen';
import { Chef } from '../Chef/Chef';
import Konva from 'konva';
import { gameLevelMachine } from './gameLevel.machine';
import { Egg } from '../Egg/Egg';
import { CHEF_DIMENSIONS } from './gameConfig';
import { ActorRefFrom } from 'xstate';
import { useSelector } from '@xstate/react';

interface GameLevelProps {
	stageDimensions: {
		width: number;
		height: number;
	};
	gameLevelActorRef: ActorRefFrom<typeof gameLevelMachine>;
}

export function GameLevel({
	stageDimensions,
	gameLevelActorRef,
}: GameLevelProps) {
	const gameLevelState = useSelector(gameLevelActorRef, (state) => state);
	const { generationIndex, remainingTime, henActorRefs, eggActorRefs } =
		gameLevelState.context;

	const chefInitialPosition = {
		x: stageDimensions.width / 2 - 0.5 * CHEF_DIMENSIONS.width,
		y: stageDimensions.height - CHEF_DIMENSIONS.height - 10,
	};

	const layerRef = useRef<Konva.Layer>(null);

	return (
		<>
			<Layer ref={layerRef}>
				{henActorRefs.map((henActorRef) => (
					<Hen key={henActorRef.id} henActorRef={henActorRef} />
				))}
			</Layer>
			<Layer>
				<Chef
					dimensions={CHEF_DIMENSIONS}
					layerRef={layerRef}
					initialPosition={chefInitialPosition}
				/>
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
					fontSize={30}
					fontFamily="Arial"
					fill="black"
				/>
				<Text
					x={200}
					y={250}
					text={`Time: ${remainingTime / 1000} seconds`}
					fontSize={30}
					fontFamily="Arial"
					fill="black"
				/>
			</Layer>
		</>
	);
}
