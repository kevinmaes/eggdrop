import { useSelector } from '@xstate/react';
import { Image as KonvaImage } from 'react-konva';

import runningChickImageFile from '../assets/running-chick.png';
import useImage from 'use-image';
import { eggMachine } from './egg.machine';
import { ActorRefFrom } from 'xstate';
import Konva from 'konva';
import { useEffect, useRef } from 'react';

export function Egg({
	eggActorRef,
}: {
	eggActorRef: ActorRefFrom<typeof eggMachine>;
}) {
	const eggState = useSelector(eggActorRef, (state) => state);
	const { gameConfig, isFacingLeft, eggFrames, eggFrameNames, color } =
		useSelector(eggActorRef, (state) => ({
			gameConfig: state.context.gameConfig,
			isFacingLeft:
				state.hasTag('chick') &&
				state.context.targetPosition.x < state.context.position.x,
			eggFrames: state.context.eggAssets.sprite.frames,
			eggFrameNames: Object.keys(state.context.eggAssets.sprite.frames),
			color: state.context.color,
		}));
	const eggRef = useRef<Konva.Image>(null);
	const [eggImage] = useImage(`../images/egg.sprite.png`);
	const [brokenEggImage] = useImage(
		`images/egg-broken-${eggState.context.color}.png`
	);
	const [runningChickImage] = useImage(runningChickImageFile);

	useEffect(() => {
		if (eggRef.current) {
			eggActorRef.send({ type: 'Set eggRef', eggRef });
		}
	}, [eggRef.current]);

	if (eggState.matches('Done')) {
		return null;
	}

	// if (eggState.matches('Hatching')) {
	// 	return (
	// 		<KonvaImage
	// 			ref={eggRef}
	// 			image={runningChickImage}
	// 			width={60}
	// 			height={60}
	// 			rotation={0}
	// 			x={eggState.context.position.x}
	// 			y={gameConfig.stageDimensions.height - gameConfig.egg.chick.height}
	// 			scaleX={isFacingLeft ? -1 : 1}
	// 		/>
	// 	);
	// }

	// if (eggState.matches('Exiting')) {
	// 	return (
	// 		<KonvaImage
	// 			ref={eggRef}
	// 			image={runningChickImage}
	// 			width={60}
	// 			height={60}
	// 			rotation={0}
	// 			x={eggState.context.position.x}
	// 			y={gameConfig.stageDimensions.height - gameConfig.egg.chick.height}
	// 			scaleX={isFacingLeft ? -1 : 1}
	// 		/>
	// 	);
	// }
	// if (eggState.matches('Splatting')) {
	// 	return (
	// 		// Render a rectangle
	// 		<KonvaImage
	// 			image={brokenEggImage}
	// 			width={gameConfig.egg.brokenEgg.width}
	// 			height={gameConfig.egg.brokenEgg.height}
	// 			rotation={0}
	// 			x={eggState.context.position.x}
	// 			// y={eggState.context.position.y}
	// 			y={gameConfig.stageDimensions.height - gameConfig.egg.brokenEgg.height}
	// 		/>
	// 	);
	// }

	console.log('eggState color, eggFrameNames', color, eggFrameNames);
	console.log('eggState eggFrames', color, eggFrameNames);
	const currentEggFrame = eggFrames[`egg-${color}.png`].frame;
	console.log('currentEggFrame', currentEggFrame);
	return (
		<KonvaImage
			ref={eggRef}
			image={eggImage}
			width={30}
			height={30}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			offsetX={15}
			offsetY={15}
			border="1px solid red"
			crop={{
				x: currentEggFrame.x,
				y: currentEggFrame.y,
				width: currentEggFrame.w,
				height: currentEggFrame.h,
			}}
		/>
	);
}
