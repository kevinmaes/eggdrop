import { useState, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { Hen } from '../Hen/Hen';
import { Chef } from '../Chef/Chef';
import { getStartXPosition } from '../Hen/hen.machine';
import Konva from 'konva';
import { Egg } from '../Egg/Egg';
import { nanoid } from 'nanoid';
import { GameLevelActorContext } from './gameLevel.machine';

interface GameLevelProps {
	stageDimensions: {
		width: number;
		height: number;
	};
}

export function GameLevel({ stageDimensions }: GameLevelProps) {
	const eggConfigs = GameLevelActorContext.useSelector(
		(state) => state.context.eggs
	);

	const chefDimensions = { width: 124, height: 150 };
	const chefInitialPosition = {
		x: stageDimensions.width / 2 - 0.5 * chefDimensions.width,
		y: stageDimensions.height - chefDimensions.height - 10,
	};

	const layerRef = useRef<Konva.Layer>(null);

	const henConfigs = new Array(1).fill(null).map(() => ({
		id: nanoid(),
		initialX: getStartXPosition(stageDimensions.width),
		initialY: 10,
	}));
	const [hens] = useState(henConfigs);

	return (
		<Stage
			width={stageDimensions.width}
			height={stageDimensions.height}
			style={{ background: 'blue' }}
		>
			<Layer ref={layerRef}>
				{hens.map((hen) => (
					<Hen
						key={hen.id}
						id={hen.id}
						layerRef={layerRef}
						stageDimensions={stageDimensions}
						initialX={hen.initialX}
						initialY={hen.initialY}
						maxEggs={-1}
						stationaryEggLayingRate={0.9}
						movingEggLayingRate={0.01}
					/>
				))}
				<Chef
					stageDimensions={stageDimensions}
					dimensions={chefDimensions}
					layerRef={layerRef}
					initialPosition={chefInitialPosition}
				/>
				{eggConfigs.map((egg) => (
					<Egg
						layerRef={layerRef}
						key={egg.id}
						id={egg.id}
						initialX={egg.initialX}
						initialY={egg.initialY}
						floorY={stageDimensions.height}
					/>
				))}
			</Layer>
		</Stage>
	);
}
