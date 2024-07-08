import { useState, useRef } from 'react';
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
	const chefDimensions = { width: 124, height: 150 };
	const chefInitialPosition = {
		x: window.innerWidth / 2 - 0.5 * chefDimensions.width,
		y: window.innerHeight - chefDimensions.height - 10,
	};
	const chefPotRef = useRef<Konva.Rect>(null);
	const layerRef = useRef<Konva.Layer>(null);

	const henConfigs = new Array(20).fill(null).map(() => ({
		id: nanoid(),
		initialX: getStartXPosition(window.innerWidth),
		initialY: 10,
	}));
	const [hens] = useState(henConfigs);
	const [chefCaughtAnEgg, setChefCaughtAnEgg] = useState(false);

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

		if (!chefPotRef.current) {
			return;
		}

		const {
			x: potX,
			y: potY,
			width: potWidth,
		} = chefPotRef.current?.getClientRect();

		if (
			position.x >= potX &&
			position.x <= potX + potWidth &&
			position.y >= potY
		) {
			console.log(`Egg ${id} caught by the chef!`);
			setEggs((eggs) => eggs.filter((egg) => egg.id !== id));

			// Don't love this hack to send an event to the child Chef component's actor.
			setChefCaughtAnEgg(true);
			setTimeout(() => {
				setChefCaughtAnEgg(false);
			}, 1);
		}
	};

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
				<Chef
					dimensions={chefDimensions}
					layerRef={layerRef}
					initialPosition={chefInitialPosition}
					caughtAnEgg={chefCaughtAnEgg}
					chefPotRef={chefPotRef}
				/>
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
			</Layer>
		</Stage>
	);
};

export default App;
