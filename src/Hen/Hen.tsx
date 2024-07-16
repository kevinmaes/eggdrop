import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import henImageFile from '../assets/hen1.png';
import { useSelector } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { henMachine } from './hen.machine';
import { useEffect, useRef } from 'react';
import Konva from 'konva';

export function Hen({
	henActorRef,
}: {
	henActorRef: ActorRefFrom<typeof henMachine>;
}) {
	const { position } = useSelector(henActorRef, (state) => ({
		position: state.context.position,
		targetPosition: state.context.targetPosition,
		speed: state.context.speed,
		baseTweenDurationSeconds: state.context.baseTweenDurationSeconds,
		gamePaused: state.context.gamePaused,
	}));
	const [henImage] = useImage(henImageFile);

	const henRef = useRef<Konva.Image>(null);
	useEffect(() => {
		if (henRef.current) {
			henActorRef.send({ type: 'Set henRef', henRef });
		}
	}, [henRef.current]);

	if (!position) {
		return null;
	}

	return (
		<KonvaImage
			ref={henRef}
			image={henImage}
			x={position.x}
			y={position.y}
			width={50}
			height={50}
		/>
	);
}
