import { useState, useRef, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { Hen } from '../Hen/Hen';
import { Chef, EggHitTestResult } from '../Chef/Chef';
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
	const gameLevelActorRef = GameLevelActorContext.useActorRef();
	const eggConfigs = GameLevelActorContext.useSelector(
		(state) => state.context.eggs
	);

	const chefDimensions = { width: 124, height: 150 };
	const chefInitialPosition = {
		x: stageDimensions.width / 2 - 0.5 * chefDimensions.width,
		y: stageDimensions.height - chefDimensions.height - 10,
	};

	const chefPotRimHitRef = useRef<Konva.Rect>(null);

	const chefPotLeftHitRef = useRef<Konva.Rect>(null);
	const chefPotRightHitRef = useRef<Konva.Rect>(null);
	const layerRef = useRef<Konva.Layer>(null);

	const henConfigs = new Array(1).fill(null).map(() => ({
		id: nanoid(),
		initialX: getStartXPosition(stageDimensions.width),
		initialY: 10,
	}));
	const [hens] = useState(henConfigs);
	const [hitTestResult] = useState<EggHitTestResult>('none');

	useEffect(() => {
		if (chefPotRimHitRef.current) {
			gameLevelActorRef.send({
				type: 'Set chefPotRimHitRef',
				chefPotRimHitRef,
			});
		}
	}, [chefPotRimHitRef.current]);

	// const [eggs, setEggs] = useState<EggConfig[]>([]);

	// const handleLayEgg = (henId: string, x: number) => {
	// 	console.log(`Hen ${henId} laid an egg at ${x}!`);
	// 	setEggs((eggs) => [
	// 		...eggs,
	// 		{ id: nanoid(), henId, initialX: x, initialY: 50 },
	// 	]);
	// };

	// const handleEggPositionUpdate = (
	// 	id: string,
	// 	position: {
	// 		x: number;
	// 		y: number;
	// 	}
	// ) => {
	// 	if (!chefPotRimHitRef.current) {
	// 		return;
	// 	}
	// 	if (!chefPotLeftHitRef.current) {
	// 		return;
	// 	}
	// 	if (!chefPotRightHitRef.current) {
	// 		return;
	// 	}

	// 	// Pot rim hit box
	// 	const {
	// 		x: potRimHitX,
	// 		y: potRimHitY,
	// 		width: potRimHitWidth,
	// 		height: potRimHitHeight,
	// 	} = chefPotRimHitRef.current?.getClientRect();

	// 	if (position.y < potRimHitY) {
	// 		return;
	// 	}

	// 	if (
	// 		position.x >= potRimHitX &&
	// 		position.x <= potRimHitX + potRimHitWidth &&
	// 		position.y >= potRimHitY &&
	// 		position.y <= potRimHitY + potRimHitHeight
	// 	) {
	// 		console.log(`Egg ${id} caught by the chef!`);
	// 		// setEggs((eggs) => eggs.filter((egg) => egg.id !== id));

	// 		// Don't love this hack to send an event to the child Chef component's actor.
	// 		setHitTestResult('caught');
	// 		setTimeout(() => {
	// 			setHitTestResult('none');
	// 		}, 1);
	// 	}

	// 	// Check for hits to the side of the pot
	// 	const {
	// 		x: potLeftHitX,
	// 		y: potLeftHitY,
	// 		width: potLeftHitWidth,
	// 		height: potLeftHitHeight,
	// 	} = chefPotLeftHitRef.current?.getClientRect();

	// 	const {
	// 		x: potRightHitX,
	// 		y: potRightHitY,
	// 		width: potRightHitWidth,
	// 		height: potRightHitHeight,
	// 	} = chefPotRightHitRef.current?.getClientRect();

	// 	if (
	// 		position.x >= potLeftHitX &&
	// 		position.x <= potLeftHitX + potLeftHitWidth &&
	// 		position.y >= potLeftHitY &&
	// 		position.y <= potLeftHitY + potLeftHitHeight
	// 	) {
	// 		console.log(`Egg ${id} hit the left side of the pot!`);
	// 		setHitTestResult('broke-left');
	// 		setTimeout(() => {
	// 			setHitTestResult('none');
	// 		}, 1);
	// 	}

	// 	if (
	// 		position.x >= potRightHitX &&
	// 		position.x <= potRightHitX + potRightHitWidth &&
	// 		position.y >= potRightHitY &&
	// 		position.y <= potRightHitY + potRightHitHeight
	// 	) {
	// 		console.log(`Egg ${id} hit the right side of the pot!`);
	// 		setHitTestResult('broke-right');
	// 		setTimeout(() => {
	// 			setHitTestResult('none');
	// 		}, 1);
	// 	}
	// };

	console.log('GameLevel render eggs', eggConfigs);

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
						stoppedEggLayingRate={0.9}
						movingEggLayingRate={0.01}
					/>
				))}
				<Chef
					stageDimensions={stageDimensions}
					dimensions={chefDimensions}
					layerRef={layerRef}
					initialPosition={chefInitialPosition}
					hitTestResult={hitTestResult}
					chefPotRimHitRef={chefPotRimHitRef}
					chefPotLeftHitRef={chefPotLeftHitRef}
					chefPotRightHitRef={chefPotRightHitRef}
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
