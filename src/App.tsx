import { useState, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { Hen } from './Hen/Hen';
// import { Egg } from './Egg/Egg';
import { Chef } from './Chef/Chef';

const App = () => {
	const layerRef = useRef<any>(null);
	const [hens] = useState([
		{ id: 1, initialX: 500, initialY: 50 },
		// { id: 2, initialX: 100, initialY: 50 },
		// { id: 2, initialX: 300, initialY: 50 },
	]);
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
				{/* <Rect
					x={70}
					y={70}
					width={100}
					height={100}
					fill="yellow"
					shadowBlur={10}
				/>
				<KonvaImage
					image={henImage}
					// x={position.x}
					// y={position.y}
					x={300}
					y={300}
					width={50}
					height={50}
				/> */}
				{/* <Hen
					key="static"
					id={100}
					initialX={200}
					initialY={200}
					layerRef={layerRef}
					onLayEgg={handleLayEgg}
				/> */}
				{hens.map((hen) => (
					<Hen
						key={hen.id}
						id={hen.id}
						initialX={hen.initialX}
						initialY={hen.initialY}
						layerRef={layerRef}
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
