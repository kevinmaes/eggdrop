import { useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { Hen } from '../Hen/Hen';
import { Chef } from '../Chef/Chef';
import Konva from 'konva';
import { GameLevelActorContext } from './gameLevel.machine';
import { Egg } from '../Egg/Egg';
import { CHEF_DIMENSIONS } from './gameConfig';

interface GameLevelProps {
	stageDimensions: {
		width: number;
		height: number;
	};
}

export function GameLevel({ stageDimensions }: GameLevelProps) {
	const { henActorRefs, eggActorRefs } = GameLevelActorContext.useSelector(
		(state) => ({
			henActorRefs: state.context.henActorRefs,
			eggActorRefs: state.context.eggActorRefs,
			henStatsById: state.context.henStatsById,
		})
	);

	const chefInitialPosition = {
		x: stageDimensions.width / 2 - 0.5 * CHEF_DIMENSIONS.width,
		y: stageDimensions.height - CHEF_DIMENSIONS.height - 10,
	};

	const layerRef = useRef<Konva.Layer>(null);

	return (
		<Stage
			width={stageDimensions.width}
			height={stageDimensions.height}
			style={{ background: 'blue' }}
		>
			{/* Background graphics layer */}
			<Layer></Layer>
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
			{/* Game Info UI layer */}
			<Layer></Layer>
		</Stage>
	);
}
