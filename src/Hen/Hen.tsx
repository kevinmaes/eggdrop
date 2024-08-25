import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
// import imageFile from '../assets/hen1.png';
import { useSelector } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { henMachine } from './hen.machine';
import { useEffect, useRef, useState } from 'react';
import Konva from 'konva';

type HenFrameName =
	| 'angle-left.png'
	| 'angle-right.png'
	| 'back-left.png'
	| 'back-right.png'
	| 'forward.png'
	| 'jump-1.png'
	| 'jump-2.png'
	| 'walk-left-1.png'
	| 'walk-left-2.png'
	| 'walk-left-3.png'
	| 'walk-left-4.png'
	| 'walk-right-1.png'
	| 'walk-right-2.png'
	| 'walk-right-3.png'
	| 'walk-right-4.png';

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
		movingDirection,
		absoluteTweenSpeed,
	} = useSelector(henActorRef, (state) => ({
		henFrames: state.context.henAssets.sprite.frames,
		position: state.context.position,
		isMoving: state.matches('Moving'),
		isLaying: state.matches('Laying Egg'),
		movingDirection: state.context.movingDirection,
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

	const [frameName, setFrameName] = useState<HenFrameName>('forward.png');
	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | null = null;
		const animationIntervalMSRange = [50, 750];

		switch (true) {
			case isLaying: {
				// Randomly choose laying frame
				const layingFrameNames: HenFrameName[] = [
					'back-left.png',
					'back-right.png',
					'jump-1.png',
					'jump-2.png',
				];
				const frameName =
					layingFrameNames[Math.floor(Math.random() * layingFrameNames.length)];
				setFrameName(frameName);
				break;
			}
			case isMoving: {
				if (movingDirection === 'none') {
					return;
				}
				const walkFrameNames: HenFrameName[] = [
					`walk-${movingDirection}-1.png`,
					`walk-${movingDirection}-2.png`,
					`walk-${movingDirection}-3.png`,
					`walk-${movingDirection}-4.png`,
				];
				// First change frameName immediately as soon as the hen starts moving
				setFrameName(walkFrameNames[0]);
				// Calculate intervalMS based on tweenSpeed where higher tweenSpeed results
				// in a lower intervalMS within the animationIntervalMSRange
				const intervalMS = Math.max(
					animationIntervalMSRange[0],
					animationIntervalMSRange[1] - absoluteTweenSpeed * 100
				);
				interval = setInterval(() => {
					setFrameName((prevFrameName) => {
						const index = walkFrameNames.indexOf(prevFrameName);
						if (index === -1 || index === walkFrameNames.length - 1) {
							return walkFrameNames[0];
						}
						return walkFrameNames[index + 1];
					});
				}, intervalMS);
				break;
			}
			default: {
				setFrameName('forward.png');
			}
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [isLaying, isMoving, movingDirection, absoluteTweenSpeed]);

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
