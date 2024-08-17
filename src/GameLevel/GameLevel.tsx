import { useRef } from 'react';
import { Layer, Text } from 'react-konva';
import { Hen } from '../Hen/Hen';
import { Chef } from '../Chef/Chef';
import Konva from 'konva';
import { gameLevelMachine } from './gameLevel.machine';
import { Egg } from '../Egg/Egg';
import { CHEF_CONFIG } from './gameConfig';
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
	const { score, generationIndex, remainingTime, henActorRefs, eggActorRefs } =
		useSelector(gameLevelActorRef, (state) => ({
			score: state.context.score,
			generationIndex: state.context.generationIndex,
			remainingTime: state.context.remainingTime,
			henActorRefs: state.context.henActorRefs,
			eggActorRefs: state.context.eggActorRefs,
		}));

	const chefInitialPosition = {
		x: stageDimensions.width / 2 - 0.5 * CHEF_CONFIG.width,
		y: stageDimensions.height - CHEF_CONFIG.height - 10,
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
					dimensions={CHEF_CONFIG}
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
				<Text
					x={10}
					y={300}
					text={`Score: ${score}`}
					fontSize={20}
					fontFamily="Arial"
					fill="black"
				/>
				<Text
					x={10}
					y={330}
					text={`Eggs: ${score}`}
					fontSize={20}
					fontFamily="Arial"
					fill="black"
				/>
				<Text
					x={10}
					y={360}
					text={`Gold: ${score}`}
					fontSize={20}
					fontFamily="Arial"
					fill="black"
				/>
			</Layer>
		</>
	);
}
