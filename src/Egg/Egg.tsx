import { useSelector } from '@xstate/react';
import { Image } from 'react-konva';

import useImage from 'use-image';
import { eggMachine } from './egg.machine';
import { ActorRefFrom } from 'xstate';
import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';

type ChickFrameName =
	| 'egg-broken-white.png'
	| 'egg-broken-black.png'
	| 'chick-forward-1.png'
	| 'chick-forward-2.png'
	| 'chick-run-left-1.png'
	| 'chick-run-left-2.png'
	| 'chick-run-right-1.png'
	| 'chick-run-right-2.png';

export function Egg({
	eggActorRef,
}: {
	eggActorRef: ActorRefFrom<typeof eggMachine>;
}) {
	const eggState = useSelector(eggActorRef, (state) => state);

	const {
		gameConfig,
		exitingDirection,
		isHatching,
		isHatched,
		isBroken,
		isExiting,
		isDone,
		eggFrames,
		chickFrames,
		color,
	} = useSelector(eggActorRef, (state) => {
		const isExiting = state.matches('Exiting');
		let exitingDirection: 'none' | 'left' | 'right' = 'none';
		if (isExiting) {
			if (state.context.targetPosition.x < state.context.position.x) {
				exitingDirection = 'left';
			} else {
				exitingDirection = 'right';
			}
		}
		return {
			gameConfig: state.context.gameConfig,
			isExiting,
			exitingDirection,
			isHatching: state.matches('Hatching'),
			isHatched: state.matches('Hatched'),
			isBroken: state.matches('Splatting'),
			isDone: state.matches('Done'),
			eggFrames: state.context.eggAssets.frames,
			eggFrameNames: Object.keys(state.context.eggAssets.frames),
			chickFrames: state.context.chickAssets.frames,
			chickFrameNames: Object.keys(state.context.chickAssets.frames),
			color: state.context.color,
		};
	});
	const eggRef = useRef<Konva.Image>(null);
	const [eggImage] = useImage(`../images/egg.sprite.png`);
	const [chickImage] = useImage(`../images/chick.sprite.png`);

	const [currentChickFrameName, setCurrentChickFrameName] =
		useState<ChickFrameName>('chick-forward-1.png');

	useEffect(() => {
		if (eggRef.current) {
			eggActorRef.send({ type: 'Set eggRef', eggRef });
		}
	}, [eggRef.current]);

	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | null = null;

		switch (true) {
			case isHatching: {
				setCurrentChickFrameName('chick-forward-2.png');
				break;
			}
			case isHatched: {
				setCurrentChickFrameName('chick-forward-1.png');
				break;
			}
			case isExiting && exitingDirection !== 'none': {
				const chikRunFrame: ChickFrameName[] = [
					`chick-run-${exitingDirection}-1.png`,
					`chick-run-${exitingDirection}-2.png`,
				];
				setCurrentChickFrameName(chikRunFrame[0]);
				interval = setInterval(() => {
					setCurrentChickFrameName((prevFrameName) => {
						const index = chikRunFrame.indexOf(prevFrameName);
						if (index === -1 || index === chikRunFrame.length - 1) {
							return chikRunFrame[0];
						}
						return chikRunFrame[index + 1];
					});
				}, 100);
				break;
			}
			default:
				break;
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [isHatching, isHatched, isExiting, exitingDirection]);

	if (isDone) {
		return null;
	}

	if (isHatching || isHatched) {
		const currentChickFrame = chickFrames[currentChickFrameName].frame;
		return (
			<Image
				ref={eggRef}
				image={chickImage}
				width={60}
				height={60}
				rotation={0}
				x={eggState.context.position.x}
				y={gameConfig.stageDimensions.height - gameConfig.egg.chick.height}
				offsetX={0.5 * gameConfig.egg.chick.width}
				crop={{
					x: currentChickFrame.x,
					y: currentChickFrame.y,
					width: currentChickFrame.w,
					height: currentChickFrame.h,
				}}
			/>
		);
	}

	if (isExiting) {
		const chickFrame = chickFrames[currentChickFrameName].frame;
		return (
			<Image
				ref={eggRef}
				image={chickImage}
				width={60}
				height={60}
				rotation={0}
				x={eggState.context.position.x}
				y={gameConfig.stageDimensions.height - gameConfig.egg.chick.height}
				crop={{
					x: chickFrame.x,
					y: chickFrame.y,
					width: chickFrame.w,
					height: chickFrame.h,
				}}
			/>
		);
	}

	if (isBroken) {
		const brokenEggFrame = chickFrames[`egg-broken-${color}.png`].frame;
		return (
			<Image
				image={chickImage}
				width={gameConfig.egg.brokenEgg.width}
				height={gameConfig.egg.brokenEgg.height}
				x={eggState.context.position.x}
				y={gameConfig.stageDimensions.height - gameConfig.egg.brokenEgg.height}
				offsetY={0}
				// Always set rotation to 0 in case egg was rotating
				rotation={0}
				crop={{
					x: brokenEggFrame.x,
					y: brokenEggFrame.y,
					width: brokenEggFrame.w,
					height: brokenEggFrame.h,
				}}
			/>
		);
	}

	const currentEggFrame = eggFrames[`egg-${color}-glow.png`].frame;
	return (
		<Image
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
