import { useState, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { Hen } from './Hen/Hen';
// import { Egg } from './Egg/Egg';
import { Chef } from './Chef/Chef';
import { pickXPosition } from './Hen/hen.machine';
import Konva from 'konva';

const App = () => {
	const layerRef = useRef<Konva.Layer>(null);

	const henConfigs = new Array(20).fill(null).map((_, index) => ({
		id: index + 1,
		initialX: pickXPosition({ context: { stageWidth: window.innerWidth } }),
		initialY: 10,
	}));
	const [hens] = useState(henConfigs);

	// const [eggs, setEggs] = useState<Egg[]>([]);

	const handleLayEgg = (henId: number, x: number) => {
		console.log(`Hen ${henId} laid an egg at ${x}!`);
		// setEggs((eggs) => [
		// 	...eggs,
		// 	{ id: `${henId}-${eggs.length}`, initialX: x, initialY: 50 },
		// ]);
	};

	// const handleUpdateEggPosition = (id, timeDiff) => {
	// 	setEggs((eggs) =>
	// 		eggs.map((egg) =>
	// 			egg.id === id
	// 				? { ...egg, initialY: egg.initialY + timeDiff * 0.1 }
	// 				: egg
	// 		)
	// 	);
	// };

	// const handleEggCollision = (id, type) => {
	// 	if (type === 'floor') {
	// 		console.log(`Egg ${id} hit the floor!`);
	// 	} else if (type === 'chef') {
	// 		console.log(`Egg ${id} caught by the chef!`);
	// 	}
	// 	setEggs((eggs) => eggs.filter((egg) => egg.id !== id));
	// };

	console.log('layerRef', layerRef.current);

	return (
		<Stage
			width={window.innerWidth}
			height={window.innerHeight}
			style={{
				backgroundColor: 'blue',
				border: '10px solid black',
			}}
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
					/>
				))}
				{/* {eggs.map((egg) => (
					<Egg
						key={egg.id}
						id={egg.id}
						initialX={egg.initialX}
						initialY={egg.initialY}
						onUpdatePosition={handleUpdateEggPosition}
						onCollision={handleEggCollision}
					/>
				))} */}
				<Chef />
			</Layer>
		</Stage>
	);
};

export default App;
