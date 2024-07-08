import { useState, useRef, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import { Hen } from './Hen/Hen';
import { Chef } from './Chef/Chef';
import { getStartXPosition } from './Hen/hen.machine';
import Konva from 'konva';
import { Egg } from './Egg/Egg';
import { nanoid } from 'nanoid';

interface EggConfig {
	id: string;
	henId: string;
	initialX: number;
	initialY: number;
}

const App = () => {
	const chefInitialPosition = {
		x: window.innerWidth / 2,
		y: window.innerHeight - 120,
	};
	const chefPositionRef = useRef<{ x: number; y: number }>(chefInitialPosition);
	const layerRef = useRef<Konva.Layer>(null);

	const henConfigs = new Array(1).fill(null).map(() => ({
		id: nanoid(),
		initialX: getStartXPosition(window.innerWidth),
		initialY: 10,
	}));
	const [hens] = useState(henConfigs);

	const [eggs, setEggs] = useState<EggConfig[]>([]);

	const handleLayEgg = (henId: string, x: number) => {
		console.log(`Hen ${henId} laid an egg at ${x}!`);
		setEggs((eggs) => [
			...eggs,
			{ id: nanoid(), henId, initialX: x, initialY: 50 },
		]);
	};

	const handleEggPositionUpdate = (
		id: string,
		position: {
			x: number;
			y: number;
		}
	) => {
		if (position.y < chefInitialPosition.y) {
			return;
		}

		const { x: chefX, y: chefY } = chefPositionRef.current;

		if (
			position.x >= chefX &&
			position.x <= chefX + 50 &&
			position.y >= chefY
		) {
			console.log(`Egg ${id} caught by the chef!`);
			setEggs((eggs) => eggs.filter((egg) => egg.id !== id));
		}
	};

	const handleChefXPositionUpdate = useCallback(
		(position: { x: number; y: number }) => {
			chefPositionRef.current = position;
		},
		[]
	);

	return (
		<Stage
			width={window.innerWidth}
			height={window.innerHeight}
			style={{ background: 'blue' }}
		>
			<Layer ref={layerRef}>
				{hens.map((hen) => (
					<Hen
						key={hen.id}
						id={hen.id}
						layerRef={layerRef}
						initialX={hen.initialX}
						initialY={hen.initialY}
						onLayEgg={handleLayEgg}
						maxEggs={1}
					/>
				))}
				{eggs.map((egg) => (
					<Egg
						layerRef={layerRef}
						key={egg.id}
						id={egg.id}
						initialX={egg.initialX}
						initialY={egg.initialY}
						onUpdatePosition={handleEggPositionUpdate}
					/>
				))}
				<Chef
					layerRef={layerRef}
					onXPositionUpdate={handleChefXPositionUpdate}
					initialPosition={chefInitialPosition}
				/>
			</Layer>
		</Stage>
	);
};

export default App;
