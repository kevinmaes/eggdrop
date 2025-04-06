import { Image } from 'react-konva';
import useImage from 'use-image';
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
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
		henSize,
		henFrames,
		position,
		isLaying,
		isMoving,
		movingDirection,
		absoluteTweenSpeed,
	} = useSelector(henActorRef, (state) => ({
		henSize: {
			width: state.context.gameConfig.hen.width,
			height: state.context.gameConfig.hen.height,
		},
		henFrames: state.context.henAssets.frames,
		position: state.context.position,
		// TODO: Getting TS errors matching on 'Moving' and need to find a fix.
		isMoving:
			state.matches({ Moving: 'Laying egg' }) ||
			state.matches({ Moving: 'Done laying egg' }) ||
			state.matches({ Moving: 'Not laying egg' }) ||
			state.matches({ Moving: 'Preparing to lay egg' }),
		isLaying: state.matches('Laying Egg'),
		movingDirection: state.context.movingDirection,
		absoluteTweenSpeed: Math.abs(state.context.currentTweenSpeed),
	}));
	const [image] = useImage('images/hen.sprite.png');

	const henRef = useRef<Konva.Image>(null);
	useEffect(() => {
		if (henRef.current) {
			henActorRef.send({
				type: 'Set henRef',
				henRef: henRef as React.RefObject<Konva.Image>,
			});
		}
	}, [henActorRef, henRef]);

	const [frameName, setFrameName] = useState<HenFrameName>('forward.png');
	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | null = null;
		const [animationIntervalMinMS, animationIntervalMaxMS] = [50, 750];

		switch (true) {
			case isLaying: {
				// Randomly choose laying frame
				const layingFrameNames: HenFrameName[] = [
					'back-left.png',
					'back-right.png',
					'jump-1.png',
					'jump-2.png',
				];
				const frameName = layingFrameNames[
					Math.floor(Math.random() * layingFrameNames.length)
				] as HenFrameName;
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
				if (walkFrameNames[0]) {
					setFrameName(walkFrameNames[0]);
				}
				// Calculate intervalMS based on tweenSpeed where higher tweenSpeed results
				// in a lower intervalMS within the animationIntervalMSRange
				const intervalMS = Math.max(
					animationIntervalMinMS,
					animationIntervalMaxMS - absoluteTweenSpeed * 100
				);
				interval = setInterval(() => {
					setFrameName((prevFrameName) => {
						const index = walkFrameNames.indexOf(prevFrameName);
						if (index === -1 || index === walkFrameNames.length - 1) {
							return walkFrameNames[0] as HenFrameName;
						}
						return walkFrameNames[index + 1] as HenFrameName;
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

	if (!position) {
		return null;
	}

	let currentFrame = henFrames[frameName]?.frame;
	if (!currentFrame) {
		return null;
	}

	return (
		<Image
			ref={henRef}
			image={image}
			x={position.x}
			y={position.y}
			width={henSize.width}
			height={henSize.height}
			crop={{
				x: currentFrame.x,
				y: currentFrame.y,
				width: currentFrame.w,
				height: currentFrame.h,
			}}
		/>
	);
}
