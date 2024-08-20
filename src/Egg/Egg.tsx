import { useSelector } from '@xstate/react';
import { Image as KonvaImage } from 'react-konva';

import runningChickImageFile from '../assets/running-chick.png';
import useImage from 'use-image';
import { eggMachine } from './egg.machine';
import { ActorRefFrom } from 'xstate';
import Konva from 'konva';
import { useEffect, useRef } from 'react';
import { EGG_CONFIG } from '../GameLevel/gameConfig';

export function Egg({
	eggActorRef,
}: {
	eggActorRef: ActorRefFrom<typeof eggMachine>;
}) {
	const eggState = useSelector(eggActorRef, (state) => state);
	const { isFacingLeft } = useSelector(eggActorRef, (state) => ({
		isFacingLeft:
			state.hasTag('chick') &&
			state.context.targetPosition.x < state.context.position.x,
	}));
	const eggRef = useRef<Konva.Image>(null);
	const eggImagePath = `../images/egg-${eggState.context.color}.png`;
	const [eggImage] = useImage(eggImagePath);
	const [brokenEggImage] = useImage('images/egg-broken.png');
	const [runningChickImage] = useImage(runningChickImageFile);

	useEffect(() => {
		if (eggRef.current) {
			eggActorRef.send({ type: 'Set eggRef', eggRef });
		}
	}, [eggRef.current]);

	if (eggState.matches('Done')) {
		return null;
	}

	return eggState.matches('Hatching') ? (
		<KonvaImage
			ref={eggRef}
			image={runningChickImage}
			width={60}
			height={60}
			rotation={0}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			scaleX={isFacingLeft ? -1 : 1}
		/>
	) : eggState.matches('Exiting') ? (
		<KonvaImage
			ref={eggRef}
			image={runningChickImage}
			width={60}
			height={60}
			rotation={0}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			scaleX={isFacingLeft ? -1 : 1}
		/>
	) : eggState.matches('Splatting') ? (
		// Render a rectangle
		<KonvaImage
			image={brokenEggImage}
			width={EGG_CONFIG.brokenEgg.width}
			height={EGG_CONFIG.brokenEgg.height}
			rotation={0}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
		/>
	) : (
		<KonvaImage
			ref={eggRef}
			image={eggImage}
			width={20}
			height={25}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			offsetX={10}
			offsetY={12.5}
		/>
	);
}
