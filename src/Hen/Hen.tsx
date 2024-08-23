import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
// import imageFile from '../assets/hen1.png';
import { useSelector } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { henMachine } from './hen.machine';
import { useEffect, useRef, useState } from 'react';
import Konva from 'konva';

export function Hen({
	henActorRef,
}: {
	henActorRef: ActorRefFrom<typeof henMachine>;
}) {
	const {
		henFrames,
		position,
		isLaying,
		isMoving,
		direction,
		absoluteTweenSpeed,
	} = useSelector(henActorRef, (state) => ({
		henFrames: state.context.henAssets.sprite.frames,
		position: state.context.position,
		isMoving: state.matches('Moving'),
		isLaying: state.matches('Laying Egg'),
		direction: state.context.currentTweenDirection,
		absoluteTweenSpeed: Math.abs(state.context.currentTweenSpeed),
	}));
	const [image] = useImage('images/hen.sprite.png');

	const henRef = useRef<Konva.Image>(null);
	useEffect(() => {
		if (henRef.current) {
			henActorRef.send({ type: 'Set henRef', henRef });
		}
	}, [henRef.current]);

	if (!position) {
		return null;
	}

	const [frameName, setFrameName] = useState('1-hen-front.png');
	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | null = null;
		const animationIntervalMSRange = [50, 1000];

		switch (true) {
			case isLaying: {
				// Randomly choose laying frame
				const layingFrameNames = [
					'3-hen-back.png',
					'4-hen-jump1.png',
					'5-hen-jump2.png',
				];
				// frameName =
				setFrameName(
					layingFrameNames[Math.floor(Math.random() * layingFrameNames.length)]
				);
				break;
			}
			case isMoving && direction === -1: {
				// First change frameName immediately as soon as the hen starts moving
				setFrameName((prevFrameName) =>
					prevFrameName === 'hen-walk-left1.png'
						? 'hen-walk-left2.png'
						: 'hen-walk-left1.png'
				);

				// Calculate intervalMS based on tweenSpeed where higher tweenSpeed results
				// in a lower intervalMS within the animationIntervalMSRange
				const intervalMS = Math.max(
					animationIntervalMSRange[0],
					animationIntervalMSRange[1] - absoluteTweenSpeed * 100
				);
				interval = setInterval(() => {
					setFrameName((prevFrameName) =>
						prevFrameName === 'hen-walk-left1.png'
							? 'hen-walk-left2.png'
							: 'hen-walk-left1.png'
					);
				}, intervalMS);
				break;
			}
			case isMoving && direction === 1: {
				// First change frameName immediately as soon as the hen starts moving
				setFrameName((prevFrameName) =>
					prevFrameName === 'hen-walk-right1.png'
						? 'hen-walk-right2.png'
						: 'hen-walk-right1.png'
				);
				// Calculate intervalMS based on tweenSpeed where higher tweenSpeed results
				// in a lower intervalMS within the animationIntervalMSRange
				const intervalMS = Math.max(
					animationIntervalMSRange[0],
					animationIntervalMSRange[1] - absoluteTweenSpeed * 100
				);
				interval = setInterval(() => {
					setFrameName((prevFrameName) =>
						prevFrameName === 'hen-walk-right1.png'
							? 'hen-walk-right2.png'
							: 'hen-walk-right1.png'
					);
				}, intervalMS);
				break;
			}
			default: {
				setFrameName('1-hen-front.png');
			}
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [isLaying, direction, isMoving, absoluteTweenSpeed]);

	let currentFrame = henFrames[frameName].frame;

	return (
		<KonvaImage
			ref={henRef}
			image={image}
			x={position.x}
			y={position.y}
			width={80}
			height={80}
			crop={{
				x: currentFrame.x,
				y: currentFrame.y,
				width: currentFrame.w,
				height: currentFrame.h,
			}}
		/>
	);
}
