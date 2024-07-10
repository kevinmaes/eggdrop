import { useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { Hen } from '../Hen/Hen';
import { Chef } from '../Chef/Chef';
import Konva from 'konva';
import { GameLevelActorContext } from './gameLevel.machine';
import { Egg } from '../Egg/Egg';

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
		})
	);

	const chefDimensions = { width: 124, height: 150 };
	const chefInitialPosition = {
		x: stageDimensions.width / 2 - 0.5 * chefDimensions.width,
		y: stageDimensions.height - chefDimensions.height - 10,
	};

	const layerRef = useRef<Konva.Layer>(null);

	return (
		<Stage
			width={stageDimensions.width}
			height={stageDimensions.height}
			style={{ background: 'blue' }}
		>
			<Layer ref={layerRef}>
				{henActorRefs.map((henActorRef) => (
					<Hen key={henActorRef.id} henActorRef={henActorRef} />
				))}
				<Chef
					stageDimensions={stageDimensions}
					dimensions={chefDimensions}
					layerRef={layerRef}
					initialPosition={chefInitialPosition}
				/>
				{eggActorRefs.map((eggActorRef) => (
					<Egg key={eggActorRef.id} eggActorRef={eggActorRef} />
				))}
			</Layer>
		</Stage>
	);

	// return (
	// 	<Stage
	// 		width={stageDimensions.width}
	// 		height={stageDimensions.height}
	// 		style={{ background: 'blue' }}
	// 	>
	// 		<Layer ref={layerRef}>
	// 			{hens.map((hen) => (
	// 				<Hen
	// 					key={hen.id}
	// 					id={hen.id}
	// 					layerRef={layerRef}
	// 					stageDimensions={stageDimensions}
	// 					initialX={hen.initialX}
	// 					initialY={hen.initialY}
	// 					maxEggs={-1}
	// 					stationaryEggLayingRate={0.9}
	// 					movingEggLayingRate={0.01}
	// 				/>
	// 			))}
	// 			<Chef
	// 				stageDimensions={stageDimensions}
	// 				dimensions={chefDimensions}
	// 				layerRef={layerRef}
	// 				initialPosition={chefInitialPosition}
	// 			/>
	// 			{eggConfigs.map((egg) => (
	// 				<Egg
	// 					layerRef={layerRef}
	// 					key={egg.id}
	// 					id={egg.id}
	// 					initialX={egg.initialX}
	// 					initialY={egg.initialY}
	// 					// floorY={stageDimensions.height}
	// 				/>
	// 			))}
	// 		</Layer>
	// 	</Stage>
	// );
}
