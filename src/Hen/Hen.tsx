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
	const henRef = useRef<Konva.Image>(null);

	const { speed, baseAnimationDuration, position, targetPosition, gamePaused } =
		useSelector(henActorRef, (state) => ({
			position: state.context.position,
			targetPosition: state.context.targetPosition,
			speed: state.context.speed,
			baseAnimationDuration: state.context.baseAnimationDuration,
			gamePaused: state.context.gamePaused,
		}));
	const tweenRef = useRef<Konva.Tween | null>(null);

	const [henImage] = useImage(henImageFile);

	useEffect(() => {
		if (henRef.current) {
			if (tweenRef.current && gamePaused === true) {
				tweenRef.current.pause();
				return;
			}
			if (tweenRef.current && gamePaused === false) {
				tweenRef.current.play();
				return;
			}

			const totalDistance = 1920;
			const xDistance = Math.abs(targetPosition.x - position.x);
			const relativeDistance = xDistance / totalDistance;
			const duration = baseAnimationDuration * (1 - relativeDistance * speed);

			tweenRef.current = new Konva.Tween({
				node: henRef.current,
				duration,
				x: targetPosition.x,
				easing: Konva.Easings.EaseInOut,
				onFinish: () => {
					henActorRef.send({ type: 'Stop moving' });
				},
			});
			tweenRef.current.play();
		}
	}, [henRef, targetPosition, gamePaused]);

	if (!position) {
		return null;
	}

	return <KonvaImage ref={henRef} image={henImage} width={50} height={50} />;
}
