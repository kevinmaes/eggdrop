import { useSelector } from '@xstate/react';
import { Image as KonvaImage } from 'react-konva';

import eggImageFile from '../assets/egg.png';
import brokenEggFile from '../assets/broken-egg2.jpeg';
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
	const eggRef = useRef<Konva.Image>(null);

	const [eggImage] = useImage(eggImageFile);
	const [brokenEggImage] = useImage(brokenEggFile);
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
			x={eggState.context.position.x}
			y={eggState.context.position.y}
		/>
	) : eggState.matches('Exiting') ? (
		<KonvaImage
			ref={eggRef}
			image={runningChickImage}
			width={60}
			height={60}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
		/>
	) : eggState.matches('Splatting') ? (
		// Render a rectangle
		<KonvaImage
			// ref={eggRef}
			image={brokenEggImage}
			width={60}
			height={60}
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
