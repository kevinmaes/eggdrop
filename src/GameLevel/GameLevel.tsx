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
import { AppActorContext } from '../app.machine';

interface GameLevelProps {
	stageDimensions: {
		width: number;
		height: number;
	};
}

export function GameLevel({ stageDimensions }: GameLevelProps) {
	const appActorRef = AppActorContext.useActorRef();
	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;
	const gameLevelState = useSelector(gameLevelActorRef, (state) => state);
	const {
		remainingTime,
		henActorRefs,
		eggActorRefs,
		aggregateHenStats,
		// henStatsById,
	} = useSelector(gameLevelActorRef, (state) => ({
		remainingTime: state.context.remainingTime,
		henActorRefs: state.context.henActorRefs,
		eggActorRefs: state.context.eggActorRefs,
		aggregateHenStats: state.context.aggregateHenStats,
		henStatsById: state.context.henStatsById,
	}));

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
					x={200}
					y={250}
					text={`Time: ${remainingTime / 1000} seconds`}
					fontSize={30}
					fontFamily="Arial"
					fill="black"
				/>
			</Layer>
			{/* Game level summary UI */}
			{gameLevelState.hasTag('summary') && (
				<Layer>
					<Text
						x={400}
						y={450}
						text={`Total eggs caught ${aggregateHenStats.totalEggsCaught}`}
						fontSize={30}
						fontFamily="Arial"
						fill="black"
					/>
				</Layer>
			)}
		</>
	);
}
